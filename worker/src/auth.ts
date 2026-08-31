import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import type { AppEnv } from "./types";

async function getConnection(env: AppEnv) {
    return mysql.createConnection({
        host: env.HYPERDRIVE.host,
        user: env.HYPERDRIVE.user,
        password: env.HYPERDRIVE.password,
        database: env.HYPERDRIVE.database,
        port: env.HYPERDRIVE.port,
        disableEval: true,
    });
}

function getJWTSecret(env: AppEnv) {
    if (!env.JWT_SECRET) {
        throw new Error("JWT_SECRET belum dikonfigurasi");
    }

    return new TextEncoder().encode(env.JWT_SECRET);
}

export async function register(
    env: AppEnv,
    username: string,
    password: string
) {
    const db = await getConnection(env);

    try {
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return {
                status: 409,
                body: {
                    message: "Username sudah digunakan",
                },
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

await db.query(
    `INSERT INTO users
    (username, password, role, gem, \`rank\`)
    VALUES (?, ?, 'student', 0, 0)`,
    [username, hashedPassword]
);

        return {
            status: 201,
            body: {
                message: "Register berhasil",
            },
        };
    } finally {
        await db.end();
    }
}

export async function login(
    env: AppEnv,
    username: string,
    password: string
) {
    const db = await getConnection(env);

    try {
        const [users] = await db.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (!Array.isArray(users) || users.length === 0) {
            return {
                status: 401,
                body: {
                    message: "Username atau password salah",
                },
            };
        }

        const user = users[0] as {
            id: number;
            username: string;
            password: string;
            role: string;
        };

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return {
                status: 401,
                body: {
                    message: "Username atau password salah",
                },
            };
        }

        const token = await new SignJWT({
            id: user.id,
            username: user.username,
            role: user.role,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1d")
            .sign(getJWTSecret(env));

        return {
            status: 200,
            body: {
                message: "Login berhasil",
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                },
            },
        };
    } finally {
        await db.end();
    }
}