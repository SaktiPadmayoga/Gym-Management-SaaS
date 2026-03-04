import * as z from "zod";

/* =========================
 * ENUMS
 * ========================= */

export const StaffRoleEnum = z.enum(["owner", "staff"]);

export const BranchRoleEnum = z.enum([
    "branch_manager",
    "trainer",
    "receptionist",
    "cashier",
]);

/* =========================
 * STAFF BRANCH SCHEMA
 * ========================= */

export const StaffBranchSchema = z.object({
    id: z.string(),
    branch_id: z.string(),
    role: BranchRoleEnum,
    is_active: z.boolean(),
    joined_at: z.string().nullable().optional(),
    branch: z
        .object({
            id: z.string(),
            name: z.string(),
            address: z.string().nullable().optional(),
        })
        .optional(),
});

export type StaffBranchData = z.infer<typeof StaffBranchSchema>;

/* =========================
 * STAFF SCHEMA
 * ========================= */

export const StaffSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
    role: StaffRoleEnum,
    is_active: z.boolean(),
    last_login_at: z.string().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    deleted_at: z.string().nullable().optional(),
    branches: z.array(StaffBranchSchema).optional(),
    current_branch_role: z.string().nullable().optional(),
});

export type StaffData = z.infer<typeof StaffSchema>;

export type StaffDataWithKeyword = StaffData & {
    search: string;
};

/* =========================
 * CREATE REQUEST
 * ========================= */

export const StaffCreateRequestSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
    role: StaffRoleEnum.optional(),
    branch_id: z.string().optional(),
    branch_role: BranchRoleEnum.optional(),
});

export type StaffCreateRequest = z.infer<typeof StaffCreateRequestSchema>;

/* =========================
 * UPDATE REQUEST
 * ========================= */

export const StaffUpdateRequestSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    phone: z.string().optional(),
    role: StaffRoleEnum.optional(),
    is_active: z.boolean().optional(),
});

export type StaffUpdateRequest = z.infer<typeof StaffUpdateRequestSchema>;

/* =========================
 * ASSIGN BRANCH REQUEST
 * ========================= */

export const AssignBranchRequestSchema = z.object({
    branch_id: z.string().min(1),
    role: BranchRoleEnum,
    joined_at: z.string().optional(),
});

export type AssignBranchRequest = z.infer<typeof AssignBranchRequestSchema>;