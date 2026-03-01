import * as z from "zod";

/* =========================
 * ACCOUNT SCHEMA
 * ========================= */

export const StatusEnum = z.enum(["trial", "active", "suspended", "cancelled"]);

export const AccountSchema = z.object({
    id: z.string(),

    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable(),
    company_name: z.string().nullable(),
    status: StatusEnum,

    last_login_at: z.string().optional(),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    deleted_at: z.string().optional(),
});

export type AccountData = z.infer<typeof AccountSchema>;

export type AccountDataWithKeyword = AccountData & {
    search: string;
};

/* =========================
 * CREATE REQUEST
 * ========================= */

export const AccountCreateRequestSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional().nullable(),
    company_name: z.string().nullable(),
    status: StatusEnum,
});

export type AccountCreateRequest = z.infer<typeof AccountCreateRequestSchema>;

/* =========================
 * UPDATE REQUEST
 * ========================= */

export const AccountUpdateRequestSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    phone: z.string().optional().nullable(),
    company_name: z.string().optional().nullable(),
});

export type AccountUpdateRequest = z.infer<typeof AccountUpdateRequestSchema>;
