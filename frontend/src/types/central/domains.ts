import { z } from "zod";

// =============================
// RELATED SCHEMAS
// =============================

export const DomainTenantSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
});

export const DomainBranchSchema = z.object({
    id: z.string(),
    name: z.string(),
    branch_code: z.string(),
});

// =============================
// MAIN DOMAIN SCHEMA
// =============================

export const DomainSchema = z.object({
    id: z.string(),
    tenant_id: z.string(),
    branch_id: z.string().nullable().optional(),
    domain: z.string(),
    type: z.enum(["tenant", "branch", "custom"]),
    is_primary: z.boolean(),
    tenant: DomainTenantSchema.optional(),
    branch: DomainBranchSchema.nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type DomainData = z.infer<typeof DomainSchema>;

// =============================
// REQUEST SCHEMAS
// =============================

export const DomainCreateRequestSchema = z.object({
    tenant_id: z.string(),
    branch_id: z.string().nullable().optional(),
    domain: z.string().min(1, "Domain is required"),
    type: z.enum(["tenant", "branch", "custom"]),
    is_primary: z.boolean().optional().default(false),
});

export type DomainCreateRequest = z.infer<typeof DomainCreateRequestSchema>;

export const DomainUpdateRequestSchema = z.object({
    branch_id: z.string().nullable().optional(),
    domain: z.string().optional(),
    type: z.enum(["tenant", "branch", "custom"]).optional(),
    is_primary: z.boolean().optional(),
});

export type DomainUpdateRequest = z.infer<typeof DomainUpdateRequestSchema>;

// =============================
// RESPONSE SCHEMAS
// =============================

export const DomainPaginatedResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.array(DomainSchema),
    meta: z.object({
        total: z.number(),
        per_page: z.number(),
        current_page: z.number(),
        last_page: z.number(),
    }).nullable().optional(),
});

export type DomainPaginatedResponse = z.infer<typeof DomainPaginatedResponseSchema>;

// =============================
// QUERY PARAMS
// =============================

export interface DomainsQueryParams {
    search?: string;
    tenant_id?: string;
    branch_id?: string;
    type?: "tenant" | "branch" | "custom";
    is_primary?: boolean;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    page?: number;
    per_page?: number;
}
