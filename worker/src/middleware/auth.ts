import { jwtVerify } from "jose";
import type { MiddlewareHandler } from "hono";
import type { AppEnv, JWTUser } from "../types";

export const authMiddleware: MiddlewareHandler<{
    Bindings: AppEnv;
    Variables: {
        user: JWTUser;
    };
}> = async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json(
            {
                message: "Token tidak ditemukan",
            },
            401
        );
    }

    const token = authHeader.substring(7);

    try {
        const secret = new TextEncoder().encode(
            c.env.JWT_SECRET
        );

        const { payload } = await jwtVerify(token, secret);

        const user: JWTUser = {
            id: Number(payload.id),
            username: String(payload.username),
            role: String(payload.role),
        };

        c.set("user", user);

        await next();
    } catch (error) {
        console.error("JWT error:", error);

        return c.json(
            {
                message: "Token tidak valid atau sudah expired",
            },
            401
        );
    }
};

export const requireRole = (
    ...allowedRoles: string[]
): MiddlewareHandler<{
    Bindings: AppEnv;
    Variables: {
        user: JWTUser;
    };
}> => {
    return async (c, next) => {
        const user = c.get("user");

        if (!allowedRoles.includes(user.role)) {
            return c.json(
                {
                    message: "Akses ditolak",
                },
                403
            );
        }

        await next();
    };
};