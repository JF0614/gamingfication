import type { Context } from "hono";
import { z } from "zod";

export type JWTUser = {
    id: number;
    username: string;
    role: string;
};

export type AppEnv = Env & {
    JWT_SECRET: string;
};

export type AppContext = Context<{
    Bindings: AppEnv;
    Variables: {
        user: JWTUser;
    };
}>;

export const Task = z.object({
    name: z.string().openapi({ example: "lorem" }),

    slug: z.string(),

    description: z.string().optional(),

    completed: z.boolean().default(false),

    due_date: z.iso.date(),
});