import * as z from "zod";

/* =========================
 * ADMIN SCHEMA (sudah ada, extend untuk auth)
 * ========================= */

export const AdminRoleEnum = z.enum(["super_admin", "finance", "support"]);

export const AdminSchema = z.object({
    id:            z.string(),
    name:          z.string(),
    email:         z.string().email(),
    role:          AdminRoleEnum,
    is_active:     z.boolean(),
    last_login_at: z.string().nullable().optional(),
    created_at:    z.string().optional(),
});

export type AdminData = z.infer<typeof AdminSchema>;

/* =========================
 * AUTH TYPES
 * ========================= */

export interface AdminLoginRequest {
    email:    string;
    password: string;
}

export interface AdminLoginResponse {
    token: string;
    admin: AdminData;
}

export interface ChangePasswordRequest {
    current_password:      string;
    new_password:          string;
    new_password_confirmation: string;
}