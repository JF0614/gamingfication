import { Hono } from "hono";
import { register, login } from "./auth";
import mysql, { type Connection } from "mysql2/promise";
import type { AppEnv } from "./types";
import { authMiddleware, requireRole } from "./middleware/auth";
import { getRank } from "./utils/rank";

const app = new Hono<{ Bindings: AppEnv  }>();

// Test database
app.get("/", async (c) => {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: c.env.HYPERDRIVE.host,
            user: c.env.HYPERDRIVE.user,
            password: c.env.HYPERDRIVE.password,
            database: c.env.HYPERDRIVE.database,
            port: c.env.HYPERDRIVE.port,
            disableEval: true,
        });

        const [rows] = await connection.query(
            "SELECT 1 AS connected"
        );

        return c.json({
            message: "Gamingfication API is running!",
            database: rows,
        });
    } catch (error) {
        console.error(error);

        return c.json(
            {
                message: "Database connection failed",
                error: String(error),
            },
            500
        );
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// REGISTER
app.post("/api/auth/register", async (c) => {
    try {
        const body = await c.req.json();

        const { username, password } = body;

        if (!username || !password) {
            return c.json(
                {
                    message: "Username dan password wajib diisi",
                },
                400
            );
        }

        const result = await register(
            c.env,
            username,
            password
        );

        return c.json(result.body, result.status as 200 | 201 | 400 | 409);
    } catch (error) {
        console.error("Register error:", error);

        return c.json(
            {
                message: "Terjadi kesalahan server",
            },
            500
        );
    }
});

// LOGIN
app.post("/api/auth/login", async (c) => {
    try {
        const body = await c.req.json();

        const { username, password } = body;

        if (!username || !password) {
            return c.json(
                {
                    message: "Username dan password wajib diisi",
                },
                400
            );
        }

        const result = await login(
            c.env,
            username,
            password
        );

        return c.json(result.body, result.status as 200 | 401 | 400);
    } catch (error) {
        console.error("Login error:", error);

        return c.json(
            {
                message: "Terjadi kesalahan server",
            },
            500
        );
    }
});

app.get(
    "/api/profile",
    authMiddleware,
    async (c) => {
        const user = c.get("user");

        let connection;

        try {
            connection = await mysql.createConnection({
                host: c.env.HYPERDRIVE.host,
                user: c.env.HYPERDRIVE.user,
                password: c.env.HYPERDRIVE.password,
                database: c.env.HYPERDRIVE.database,
                port: c.env.HYPERDRIVE.port,
                disableEval: true,
            });

            const [rows] = await connection.query(
                `SELECT id, username, role, gem, \`rank\`
                FROM users
                WHERE id = ?`,
                [user.id]
            );

            if (!Array.isArray(rows) || rows.length === 0) {
                return c.json(
                    { message: "User tidak ditemukan" },
                    404
                );
            }

            return c.json({
                message: "Profile berhasil diambil",
                user: rows[0],
            });
        } catch (error) {
            console.error("Profile error:", error);

            return c.json(
                { message: "Terjadi kesalahan server" },
                500
            );
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
);

app.get(
    "/api/teacher",
    authMiddleware,
    requireRole("teacher"),
    (c) => {
        const user = c.get("user");

        return c.json({
            message: "Akses teacher berhasil",
            user,
        });
    }
);

app.get(
    "/api/student",
    authMiddleware,
    requireRole("student"),
    (c) => {
        const user = c.get("user");

        return c.json({
            message: "Akses student berhasil",
            user,
        });
    }
);

app.post(
    "/api/teacher/users/:id/gem",
    authMiddleware,
    requireRole("teacher"),
    async (c) => {
        const studentId = Number(c.req.param("id"));

        if (!Number.isInteger(studentId) || studentId <= 0) {
            return c.json(
                { message: "ID siswa tidak valid" },
                400
            );
        }

        let connection: Connection | undefined;

        try {
            connection = await mysql.createConnection({
                host: c.env.HYPERDRIVE.host,
                user: c.env.HYPERDRIVE.user,
                password: c.env.HYPERDRIVE.password,
                database: c.env.HYPERDRIVE.database,
                port: c.env.HYPERDRIVE.port,
                disableEval: true,
            });

            const body = await c.req.json<{
                gem: number;
            }>();

            if (
                typeof body.gem !== "number" ||
                !Number.isInteger(body.gem) ||
                body.gem <= 0
            ) {
                return c.json(
                    { message: "Jumlah Gem harus bilangan positif" },
                    400
                );
            }

            const [currentRows] = await connection.query(
                `SELECT id, username, gem, \`rank\`
                 FROM users
                 WHERE id = ? AND role = 'student'`,
                [studentId]
            );

            if (
                !Array.isArray(currentRows) ||
                currentRows.length === 0
            ) {
                return c.json(
                    { message: "Siswa tidak ditemukan" },
                    404
                );
            }

            const student = currentRows[0] as {
                id: number;
                username: string;
                gem: number;
                rank: number;
            };

            const newGem = student.gem + body.gem;
            const currentRank = student.rank;
            const calculatedRank = getRank(newGem);

            const newRank =
                calculatedRank > currentRank
                    ? calculatedRank
                    : currentRank;

            await connection.query(
                `UPDATE users
                 SET gem = ?, \`rank\` = ?
                 WHERE id = ? AND role = 'student'`,
                [newGem, newRank, studentId]
            );

            return c.json({
                message: "Gem berhasil ditambahkan",
                student: {
                    id: student.id,
                    username: student.username,
                    gem: newGem,
                    rank: newRank,
                },
            });
        } catch (error) {
            console.error("Add gem error:", error);

            return c.json(
                { message: "Terjadi kesalahan server" },
                500
            );
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
);

app.get(
    "/api/teacher/students",
    authMiddleware,
    requireRole("teacher"),
    async (c) => {
        let connection;

        try {
            const search = c.req.query("search")?.trim() || "";

            connection = await mysql.createConnection({
                host: c.env.HYPERDRIVE.host,
                user: c.env.HYPERDRIVE.user,
                password: c.env.HYPERDRIVE.password,
                database: c.env.HYPERDRIVE.database,
                port: c.env.HYPERDRIVE.port,
                disableEval: true,
            });

            const [rows] = await connection.query(
                `SELECT id, username, gem, \`rank\`
                 FROM users
                 WHERE role = 'student'
                 AND username LIKE ?
                 ORDER BY username ASC`,
                [`%${search}%`]
            );

            return c.json({
                message: "Daftar siswa berhasil diambil",
                students: rows,
            });
        } catch (error) {
            console.error("Get students error:", error);

            return c.json(
                { message: "Terjadi kesalahan server" },
                500
            );
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
);

app.get(
    "/api/teacher/students/:id",
    authMiddleware,
    requireRole("teacher"),
    async (c) => {
        const studentId = Number(c.req.param("id"));

        if (!Number.isInteger(studentId) || studentId <= 0) {
            return c.json(
                { message: "ID siswa tidak valid" },
                400
            );
        }

        let connection;

        try {
            connection = await mysql.createConnection({
                host: c.env.HYPERDRIVE.host,
                user: c.env.HYPERDRIVE.user,
                password: c.env.HYPERDRIVE.password,
                database: c.env.HYPERDRIVE.database,
                port: c.env.HYPERDRIVE.port,
                disableEval: true,
            });

            const [rows] = await connection.query(
                `SELECT id, username, gem, \`rank\`
                 FROM users
                 WHERE id = ? AND role = 'student'`,
                [studentId]
            );

            if (!Array.isArray(rows) || rows.length === 0) {
                return c.json(
                    { message: "Siswa tidak ditemukan" },
                    404
                );
            }

            return c.json({
                message: "Profile siswa berhasil diambil",
                student: rows[0],
            });
        } catch (error) {
            console.error("Student profile error:", error);

            return c.json(
                { message: "Terjadi kesalahan server" },
                500
            );
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
);

app.post(
    "/api/teacher/users/:id/gem/remove",
    authMiddleware,
    requireRole("teacher"),
    async (c) => {
        const studentId = Number(c.req.param("id"));

        if (!Number.isInteger(studentId) || studentId <= 0) {
            return c.json(
                { message: "ID siswa tidak valid" },
                400
            );
        }

        let connection;

        try {
            const body = await c.req.json<{
                gem: number;
            }>();

            if (
                typeof body.gem !== "number" ||
                !Number.isInteger(body.gem) ||
                body.gem <= 0
            ) {
                return c.json(
                    { message: "Jumlah XP harus bilangan positif" },
                    400
                );
            }

            connection = await mysql.createConnection({
                host: c.env.HYPERDRIVE.host,
                user: c.env.HYPERDRIVE.user,
                password: c.env.HYPERDRIVE.password,
                database: c.env.HYPERDRIVE.database,
                port: c.env.HYPERDRIVE.port,
                disableEval: true,
            });

            const [result] = await connection.query(
                `UPDATE users
                 SET gem = GREATEST(gem - ?, 0)
                 WHERE id = ? AND role = 'student'`,
                [body.gem, studentId]
            );

            const updateResult = result as mysql.ResultSetHeader;

            if (updateResult.affectedRows === 0) {
                return c.json(
                    { message: "Siswa tidak ditemukan" },
                    404
                );
            }

            const [rows] = await connection.query(
    `SELECT id, username, gem, \`rank\`
     FROM users
     WHERE id = ? AND role = 'student'`,
    [studentId]
);

if (!Array.isArray(rows) || rows.length === 0) {
    return c.json(
        { message: "Siswa tidak ditemukan" },
        404
    );
}

return c.json({
    message: "XP berhasil dikurangi",
    student: rows[0],
});
        } catch (error) {
            console.error("Remove gem error:", error);

            return c.json(
                { message: "Terjadi kesalahan server" },
                500
            );
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
);

app.post(
    "/api/teacher/users/:id/rank",
    authMiddleware,
    requireRole("teacher"),
    async (c) => {
        const studentId = Number(c.req.param("id"));

        if (!Number.isInteger(studentId) || studentId <= 0) {
            return c.json(
                { message: "ID siswa tidak valid" },
                400
            );
        }

        let connection: Connection | undefined;

        try {
            const body = await c.req.json<{
                rank: number;
            }>();

            if (
                typeof body.rank !== "number" ||
                !Number.isInteger(body.rank) ||
                body.rank < 0 ||
                body.rank > 6
            ) {
                return c.json(
                    { message: "Rank harus antara 0 sampai 6" },
                    400
                );
            }

            connection = await mysql.createConnection({
                host: c.env.HYPERDRIVE.host,
                user: c.env.HYPERDRIVE.user,
                password: c.env.HYPERDRIVE.password,
                database: c.env.HYPERDRIVE.database,
                port: c.env.HYPERDRIVE.port,
                disableEval: true,
            });

            const [rows] = await connection.query(
                `SELECT id, username, gem, \`rank\`
                 FROM users
                 WHERE id = ? AND role = 'student'`,
                [studentId]
            );

            if (!Array.isArray(rows) || rows.length === 0) {
                return c.json(
                    { message: "Siswa tidak ditemukan" },
                    404
                );
            }

            await connection.query(
                `UPDATE users
                 SET \`rank\` = ?
                 WHERE id = ? AND role = 'student'`,
                [body.rank, studentId]
            );

            return c.json({
                message: "Rank siswa berhasil diubah",
                student: {
                    id: studentId,
                    username: (rows[0] as any).username,
                    gem: (rows[0] as any).gem,
                    rank: body.rank,
                },
            });
        } catch (error) {
            console.error("Update rank error:", error);

            return c.json(
                { message: "Terjadi kesalahan server" },
                500
            );
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
);

export default app;