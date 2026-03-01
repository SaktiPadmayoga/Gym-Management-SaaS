import * as z from "zod";

export const PricingSchema = z.object({
    monthly: z.number().int().nonnegative(),
    yearly: z.number().int().nonnegative(),
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
    currency: z.string(),

    max_membership: z.number().optional(),
    max_staff: z.number().optional(),
    max_branches: z.number().optional(),

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
        currency: data.pricing.currency,

        max_membership: data.limits.max_membership,
        max_staff: data.limits.max_staff,
        max_branches: data.limits.max_branches,

        features: data.features,

        is_active: data.is_active,
        is_public: data.is_public,
    };
};
