import * as z from "zod";

/* =========================
 * ENUMS
 * ========================= */

export const MemberStatusEnum = z.enum(["active", "inactive", "expired", "frozen", "banned"]);

export const MembershipStatusEnum = z.enum(["active", "expired", "cancelled", "frozen"]);

export const GenderEnum = z.enum(["male", "female", "other"]);

/* =========================
 * MEMBERSHIP SCHEMA (Pengganti MemberBranch)
 * ========================= */

export const MembershipSchema = z.object({
    id: z.string(),
    plan_id: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    status: MembershipStatusEnum,
    unlimited_checkin: z.boolean(),
    remaining_checkin_quota: z.number().nullable().optional(),
    total_checkins: z.number().default(0),
    frozen_until: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    // Relasi yang di-load
    plan: z
        .object({
            id: z.string(),
            name: z.string(),
        })
        .optional(),
});

export type MembershipData = z.infer<typeof MembershipSchema>;

/* =========================
 * MEMBER SCHEMA
 * ========================= */

export const MemberSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    emergency_contact: z.string().nullable().optional(),
    gender: GenderEnum.nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
    avatar_url: z.string().nullable().optional(), // Diubah menyesuaikan resource backend
    address: z.string().nullable().optional(),
    id_card_number: z.string().nullable().optional(),
    status: MemberStatusEnum,
    is_active: z.boolean(),
    member_since: z.string().nullable().optional(),
    last_checkin_at: z.string().nullable().optional(),
    last_login_at: z.string().nullable().optional(),
    created_at: z.string().optional(),

    // Relasi
    home_branch: z
        .object({
            id: z.string(),
            name: z.string(),
        })
        .nullable()
        .optional(),

    memberships: z.array(MembershipSchema).optional(),
});

export type MemberData = z.infer<typeof MemberSchema>;
export type MemberDataWithKeyword = MemberData & { search: string };

/* =========================
 * CREATE REQUEST
 * ========================= */

export const MemberCreateRequestSchema = z.object({
    home_branch_id: z.string().optional(),
    name: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    emergency_contact: z.string().optional(),
    gender: GenderEnum.optional(),
    date_of_birth: z.string().optional(),
    avatar: z.any().nullable().optional(),
    address: z.string().optional(),
    id_card_number: z.string().optional(),
    password: z.string().optional(),
    is_active: z.boolean().optional(),
});

export type MemberCreateRequest = z.infer<typeof MemberCreateRequestSchema>;

/* =========================
 * UPDATE REQUEST
 * ========================= */

export const MemberUpdateRequestSchema = z.object({
    home_branch_id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email().nullable().optional().or(z.literal("")),
    phone: z.string().nullable().optional(),
    emergency_contact: z.string().nullable().optional(),
    gender: GenderEnum.nullable().optional(),
    avatar: z.any().nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    id_card_number: z.string().nullable().optional(),
    password: z.string().optional(),
    status: MemberStatusEnum.optional(),
    is_active: z.boolean().optional(),
});

export type MemberUpdateRequest = z.infer<typeof MemberUpdateRequestSchema>;

/* =========================
 * ASSIGN MEMBERSHIP REQUEST (Pembelian Paket)
 * ========================= */

export const AssignMembershipRequestSchema = z.object({
    plan_id: z.string(),
    start_date: z.string(),
    end_date: z.string().optional(), // Bisa otomatis dikalkulasi dari durasi plan di BE
    notes: z.string().optional(),
});

export type AssignMembershipRequest = z.infer<typeof AssignMembershipRequestSchema>;

/* =========================
 * UPDATE MEMBERSHIP REQUEST
 * ========================= */

export const UpdateMembershipRequestSchema = z.object({
    status: MembershipStatusEnum.optional(),
    end_date: z.string().optional(),
    frozen_until: z.string().optional(),
    notes: z.string().optional(),
});

export type UpdateMembershipRequest = z.infer<typeof UpdateMembershipRequestSchema>;
