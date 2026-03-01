import * as z from "zod";

/* =========================
 * ENUMS
 * ========================= */

export const TenantUserRoleEnum = z.enum(["owner", "admin", "staff", "cashier", "trainer"]);
export const TenantUserStatusEnum = z.enum(["active", "inactive", "suspended"]);

/* =========================
 * USER SCHEMA
 * ========================= */

export const TenantUserSchema = z.object({
    id: z.string(),

    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable(),

    role: TenantUserRoleEnum,
    status: TenantUserStatusEnum,

    last_login_at: z.string().nullable().optional(),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    deleted_at: z.string().optional(),
});

export type TenantUserData = z.infer<typeof TenantUserSchema>;

export type TenantUserDataWithKeyword = TenantUserData & {
    search: string;
};

/* =========================
 * CREATE REQUEST
 * ========================= */

export const TenantUserCreateRequestSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),

    phone: z.string().optional().nullable(),

    role: TenantUserRoleEnum,
    status: TenantUserStatusEnum,
});

export type TenantUserCreateRequest = z.infer<typeof TenantUserCreateRequestSchema>;

/* =========================
 * UPDATE REQUEST
 * ========================= */

export const TenantUserUpdateRequestSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),

    phone: z.string().optional().nullable(),

    role: TenantUserRoleEnum.optional(),
    status: TenantUserStatusEnum.optional(),
});

export type TenantUserUpdateRequest = z.infer<typeof TenantUserUpdateRequestSchema>;