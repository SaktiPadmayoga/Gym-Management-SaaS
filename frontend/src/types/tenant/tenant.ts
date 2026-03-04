import * as z from "zod";

export const BranchSchema = z.object({
    id: z.string(),
    name: z.string(),
    address: z.string().nullable().optional(),
    is_main: z.boolean(),
});

export const SubscriptionInfoSchema = z.object({
    id: z.string(),
    status: z.string(),
    billing_cycle: z.string(),
    current_period_ends_at: z.string().nullable().optional(),
    plan_name: z.string(),
    plan_code: z.string().nullable().optional(),
});

export const TenantCurrentSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    logo_url: z.string().nullable().optional(),
    status: z.string(),
    owner_name: z.string(),
    owner_email: z.string(),
    max_branches: z.number(),
    current_branch_count: z.number(),
    subscription_ends_at: z.string().nullable().optional(),
    trial_ends_at: z.string().nullable().optional(),
    subscription: SubscriptionInfoSchema.nullable().optional(),
    current_branch: BranchSchema.nullable().optional(),
    branches: z.array(BranchSchema),
});

export type BranchData = z.infer<typeof BranchSchema>;
export type TenantCurrentData = z.infer<typeof TenantCurrentSchema>;