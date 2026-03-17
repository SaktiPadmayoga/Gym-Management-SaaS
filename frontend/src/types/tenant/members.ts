import * as z from "zod";

/* =========================
 * ENUMS
 * ========================= */

export const MemberStatusEnum = z.enum([
    "active",
    "inactive",
    "expired",
    "frozen",
    "banned",
]);

export const MemberBranchStatusEnum = z.enum([
    "active",
    "inactive",
    "expired",
    "frozen",
    "cancelled",
]);

export const GenderEnum = z.enum(["male", "female"]);

/* =========================
 * MEMBER BRANCH SCHEMA
 * ========================= */

export const MemberBranchSchema = z.object({
    id:                 z.string(),
    branch_id:          z.string(),
    status:             MemberBranchStatusEnum,
    plan_id:            z.string().nullable().optional(),
    member_code:        z.string().nullable().optional(),
    is_primary:         z.boolean(),
    started_at:         z.string().nullable().optional(),
    expires_at:         z.string().nullable().optional(),
    frozen_at:          z.string().nullable().optional(),
    frozen_until:       z.string().nullable().optional(),
    freeze_days_used:   z.number().default(0),
    days_until_expiry:  z.number().nullable().optional(),
    is_expired:         z.boolean().optional(),
    notes:              z.string().nullable().optional(),
    joined_at:          z.string().nullable().optional(),
    last_checkin_at:    z.string().nullable().optional(),
    branch: z.object({
        id:      z.string(),
        name:    z.string(),
        address: z.string().nullable().optional(),
    }).optional(),
});

export type MemberBranchData = z.infer<typeof MemberBranchSchema>;

/* =========================
 * MEMBER SCHEMA
 * ========================= */

export const MemberSchema = z.object({
    id:                 z.string(),
    name:               z.string(),
    email:              z.string().nullable().optional(),
    phone:              z.string().nullable().optional(),
    emergency_contact:  z.string().nullable().optional(),
    gender:             GenderEnum.nullable().optional(),
    date_of_birth:      z.string().nullable().optional(),
    age:                z.number().nullable().optional(),
    avatar:             z.string().nullable().optional(),
    address:            z.string().nullable().optional(),
    id_card_number:     z.string().nullable().optional(),
    status:             MemberStatusEnum,
    is_active:          z.boolean(),
    member_since:       z.string().nullable().optional(),
    last_checkin_at:    z.string().nullable().optional(),
    last_login_at:      z.string().nullable().optional(),
    created_at:         z.string().optional(),
    branches:           z.array(MemberBranchSchema).optional(),
    primary_branch:     MemberBranchSchema.nullable().optional(),
    current_membership: MemberBranchSchema.nullable().optional(),
});

export type MemberData = z.infer<typeof MemberSchema>;

export type MemberDataWithKeyword = MemberData & { search: string };

/* =========================
 * CREATE REQUEST
 * ========================= */

export const MemberCreateRequestSchema = z.object({
    name:               z.string().min(1),
    email:              z.string().email().optional(),
    phone:              z.string().optional(),
    emergency_contact:  z.string().optional(),
    gender:             GenderEnum.optional(),
    date_of_birth:      z.string().optional(),
    address:            z.string().optional(),
    id_card_number:     z.string().optional(),
    password:           z.string().optional(),
    // membership
    branch_id:          z.string().optional(),
    plan_id:            z.string().optional(),
    started_at:         z.string().optional(),
    expires_at:         z.string().optional(),
    member_code:        z.string().optional(),
    is_primary:         z.boolean().optional(),
});

export type MemberCreateRequest = z.infer<typeof MemberCreateRequestSchema>;

/* =========================
 * UPDATE REQUEST
 * ========================= */

export const MemberUpdateRequestSchema = z.object({
    name:               z.string().optional(),
    email:              z.string().email().nullable().optional(),
    phone:              z.string().nullable().optional(),
    emergency_contact:  z.string().nullable().optional(),
    gender:             GenderEnum.nullable().optional(),
    date_of_birth:      z.string().nullable().optional(),
    address:            z.string().nullable().optional(),
    id_card_number:     z.string().nullable().optional(),
    password:           z.string().optional(),
    status:             MemberStatusEnum.optional(),
    is_active:          z.boolean().optional(),
});

export type MemberUpdateRequest = z.infer<typeof MemberUpdateRequestSchema>;

/* =========================
 * UPDATE MEMBERSHIP REQUEST
 * ========================= */

export const UpdateMembershipRequestSchema = z.object({
    status:       MemberBranchStatusEnum,
    expires_at:   z.string().optional(),
    frozen_until: z.string().optional(),
    plan_id:      z.string().optional(),
    notes:        z.string().optional(),
});

export type UpdateMembershipRequest = z.infer<typeof UpdateMembershipRequestSchema>;

/* =========================
 * ASSIGN BRANCH REQUEST
 * ========================= */

export const AssignMemberBranchRequestSchema = z.object({
    branch_id:    z.string(),
    plan_id:      z.string().optional(),
    started_at:   z.string().optional(),
    expires_at:   z.string().optional(),
    member_code:  z.string().optional(),
    is_primary:   z.boolean().optional(),
    notes:        z.string().optional(),
});

export type AssignMemberBranchRequest = z.infer<typeof AssignMemberBranchRequestSchema>;