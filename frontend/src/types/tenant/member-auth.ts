import * as z from "zod";
import { MemberData } from "./members";

/* =========================
 * REQUEST SCHEMAS (Opsional: Berguna jika kamu pakai form handler seperti SvelteKit Superforms/React Hook Form)
 * ========================= */

export const MemberLoginRequestSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(1, "Password wajib diisi"),
});

export const ChangePasswordRequestSchema = z
    .object({
        current_password: z.string().min(1, "Password saat ini wajib diisi"),
        new_password: z.string().min(8, "Password baru minimal 8 karakter"),
        new_password_confirmation: z.string(),
    })
    .refine((data) => data.new_password === data.new_password_confirmation, {
        message: "Konfirmasi password tidak cocok",
        path: ["new_password_confirmation"],
    });

/* =========================
 * TYPES / INTERFACES
 * ========================= */

export interface MemberLoginRequest {
    email: string;
    password: string;
}

export interface MemberLoginResponse {
    token: string;
    member: MemberData;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}
