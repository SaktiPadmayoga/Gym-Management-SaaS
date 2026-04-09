import * as z from "zod";

/* =========================
   ENUMS
========================= */

export const StatusEnum = z.enum(["trial", "active", "inactive", "suspended"]);

/* =========================
   DOMAIN
========================= */

export const DomainSchema = z.object({
    id: z.string(),
    domain: z.string(),
    type: z.string(),
    phone: z.string().nullable(),

    is_primary: z.boolean(),
});

/* =========================
   SUBSCRIPTION
========================= */

export const SubscriptionSchema = z.object({
    id: z.string(),
    status: StatusEnum,

    plan: z
        .object({
            id: z.string(),
            name: z.string(),
        })
        .nullable()
        .optional(),

    started_at: z.string().nullable(),
    trial_ends_at: z.string().nullable(),
    current_period_ends_at: z.string().nullable(),
});

/* =========================
   TENANT
========================= */

export const TenantsSchema = z.object({
    id: z.string(),

    name: z.string().min(1),
    slug: z.string().min(1),
    owner_name: z.string().min(1),
    owner_email: z.string().email(),

    // phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    logo_url: z.string().nullable().optional(),

    status: StatusEnum.optional(),
    timezone: z.string().optional(),
    currency: z.string().optional(),
    locale: z.string().optional(),
    max_branches: z.number().optional(),
    current_branch_count: z.number().optional(),

    trial_ends_at: z.string().nullable().optional(),
    subscription_ends_at: z.string().nullable().optional(),

    domains: z.array(DomainSchema).optional(),

    latestSubscription: SubscriptionSchema.nullable().optional(),

    branches: z
        .array(
            z.object({
                id: z.string(),
                code: z.string(),
                name: z.string(),
                is_active: z.boolean(),
                address: z.string().nullable(),
                city: z.string().nullable(),
                email: z.string().nullable(),
                phone: z.string().nullable(),
            }),
        )
        .optional(),

    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable(),
});

export type TenantsData = z.infer<typeof TenantsSchema>;

export type TenantsDataWithKeyword = {
    search: string;
};

export type PaginationMeta = {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
};

export type TenantsPaginatedResponse = {
    success: boolean;
    message: string;
    data: TenantsData[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
};

/* =========================
   CREATE TENANT REQUEST
========================= */

export const TenantCreateRequestSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    owner_name: z.string().min(1),
    owner_email: z.string().email(),

    // phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    logo_url: z.string().nullable().optional(),

    status: StatusEnum.optional(),
    timezone: z.string().optional(),
    currency: z.string().optional(),
    locale: z.string().optional(),

    trial_ends_at: z.string().nullable().optional(),
    subscription_ends_at: z.string().nullable().optional(),

    branch: z.object({
        branch_code: z.string().min(1),
        name: z.string().min(1),
        address: z.string().optional(),
        city: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().email().optional(),
        timezone: z.string().min(1),
        opened_at: z.string().nullable().optional(),
    }),
});

export type TenantCreateRequest = z.infer<typeof TenantCreateRequestSchema>;

/* =========================
   UPDATE TENANT REQUEST
========================= */

export const TenantUpdateRequestSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    owner_name: z.string().min(1),
    owner_email: z.string().email(),

    // phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    logo_url: z.string().nullable().optional(),

    status: StatusEnum.optional(),
    timezone: z.string().optional(),
    currency: z.string().optional(),
    locale: z.string().optional(),

    trial_ends_at: z.string().nullable().optional(),
    subscription_ends_at: z.string().nullable().optional(),
});

export type TenantUpdateRequest = z.infer<typeof TenantUpdateRequestSchema>;
