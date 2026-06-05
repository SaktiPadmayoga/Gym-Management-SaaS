import * as z from "zod";

export const PricingSchema = z.object({
    monthly: z.number().int().nonnegative(),
    yearly: z.number().int().nonnegative(),
    setup_fee: z.number().int().nonnegative().optional(),
    currency: z.string(),
});

export const LimitsSchema = z.object({
    max_membership: z.number(),
    max_staff: z.number(),
    max_branches: z.number(),
});

export const PlansSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    code: z.string(),

    pricing: PricingSchema,
    limits: LimitsSchema,

    features: z.array(z.string()),

    allow_multi_branch: z.boolean().optional(),
    allow_cross_branch_attendance: z.boolean().optional(),

    is_active: z.boolean(),
    is_public: z.boolean(),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    deleted_at: z.string().optional(),
});

export type PlansData = z.infer<typeof PlansSchema>;
export type PlansDataWithKeyword = PlansData & {
    search: string;
};

export const PlanCreateRequestSchema = z.object({
    name: z.string(),
    code: z.string(),

    price_monthly: z.number().int().nonnegative(),
    price_yearly: z.number().int().nonnegative(),
    setup_fee: z.number().int().nonnegative().optional(),
    currency: z.string(),

    max_membership: z.number().optional(),
    max_staff: z.number().optional(),
    max_branches: z.number().optional(),

    allow_multi_branch: z.boolean().optional(),
    allow_cross_branch_attendance: z.boolean().optional(),

    features: z.array(z.string()).optional(),

    is_active: z.boolean(),
    is_public: z.boolean(),
});

export type PlanCreateRequest = z.infer<typeof PlanCreateRequestSchema>;

export const mapPlanFormToCreateRequest = (data: PlansData): PlanCreateRequest => {
    return {
        name: data.name,
        code: data.code,

        price_monthly: data.pricing.monthly,
        price_yearly: data.pricing.yearly,
        setup_fee: data.pricing.setup_fee,
        currency: data.pricing.currency,

        max_membership: data.limits.max_membership,
        max_staff: data.limits.max_staff,
        max_branches: data.limits.max_branches,

        allow_multi_branch: data.allow_multi_branch,
        allow_cross_branch_attendance: data.allow_cross_branch_attendance,

        features: data.features,

        is_active: data.is_active,
        is_public: data.is_public,
    };
};
