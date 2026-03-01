import * as z from "zod";

/* =========================
   DOMAIN (reused from tenants)
========================= */

export const BranchDomainSchema = z.object({
    id: z.string(),
    domain: z.string(),
    type: z.string(),
    is_primary: z.boolean(),
});

/* =========================
   TENANT (simplified for branch response)
========================= */

export const BranchTenantSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
});

/* =========================
   BRANCH USER
========================= */

export const BranchUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string().nullable().optional(),
    is_active: z.boolean().nullable().optional(),
});

/* =========================
   TENANT BRANCH
========================= */

export const TenantBranchSchema = z.object({
    id: z.string(),
    tenant_id: z.string(),
    branch_code: z.string(),
    name: z.string(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    timezone: z.string().nullable().optional(),
    is_active: z.boolean(),
    opened_at: z.string().nullable().optional(),

    tenant: BranchTenantSchema.optional(),
    domains: z.array(BranchDomainSchema).optional(),
    users: z.array(BranchUserSchema).optional(),

    created_at: z.string(),
    updated_at: z.string(),
});

export type TenantBranchData = z.infer<typeof TenantBranchSchema>;

export type TenantBranchPaginatedResponse = {
    success: boolean;
    message: string;
    data: TenantBranchData[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
};

/* =========================
   CREATE BRANCH REQUEST
========================= */

export const TenantBranchCreateRequestSchema = z.object({
    tenant_id: z.string().uuid(),
    branch_code: z.string().min(1),
    name: z.string().min(1),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    timezone: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
    opened_at: z.string().nullable().optional(),
});

export type TenantBranchCreateRequest = z.infer<typeof TenantBranchCreateRequestSchema>;

/* =========================
   UPDATE BRANCH REQUEST
========================= */

export const TenantBranchUpdateRequestSchema = z.object({
    branch_code: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    timezone: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
    opened_at: z.string().nullable().optional(),
});

export type TenantBranchUpdateRequest = z.infer<typeof TenantBranchUpdateRequestSchema>;
