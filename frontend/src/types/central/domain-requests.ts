import * as z from "zod";

export const DomainRequestStatusEnum = z.enum(["pending", "approved", "rejected"]);

export const DomainRequestSchema = z.object({
    id: z.string(),
    tenant_id: z.string(),
    branch_id: z.string().nullable().optional(),
    current_domain: z.string(),
    requested_domain: z.string(),
    status: DomainRequestStatusEnum,
    rejection_reason: z.string().nullable().optional(),
    reviewed_at: z.string().nullable().optional(),

    tenant: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
    }).optional(),

    reviewer: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable().optional(),

    created_at: z.string(),
    updated_at: z.string(),
});

export type DomainRequestData = z.infer<typeof DomainRequestSchema>;

export type DomainRequestPaginatedResponse = {
    success: boolean;
    message: string;
    data: DomainRequestData[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
};

export const CreateDomainRequestSchema = z.object({
    branch_id: z.string().nullable().optional(),
    requested_domain: z.string().min(1, "Domain is required"),
});

export type CreateDomainRequest = z.infer<typeof CreateDomainRequestSchema>;