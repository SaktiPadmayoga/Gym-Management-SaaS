import * as z from "zod";

/* =========================
 * ADMIN SCHEMA
 * ========================= */

export const AdminRoleEnum = z.enum(["super_admin", "finance", "support"]);

export const AdminSchema = z.object({
    id: z.string(),

    name: z.string(),
    email: z.string().email(),

    role: AdminRoleEnum,
    is_active: z.boolean(),

    last_login_at: z.string().nullable().optional(),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    deleted_at: z.string().optional(),
});

export type AdminData = z.infer<typeof AdminSchema>;

export type AdminDataWithKeyword = AdminData & {
    search: string;
};

/* =========================
 * CREATE REQUEST
 * ========================= */

export const AdminCreateRequestSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: AdminRoleEnum,
});

export type AdminCreateRequest = z.infer<typeof AdminCreateRequestSchema>;

/* =========================
 * UPDATE REQUEST
 * ========================= */

export const AdminUpdateRequestSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    role: AdminRoleEnum.optional(),
    is_active: z.boolean().optional(),
});



export type AdminUpdateRequest = z.infer<typeof AdminUpdateRequestSchema>;