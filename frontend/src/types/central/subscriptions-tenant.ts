
import * as z from "zod";

// types/central/subscriptions-tenant.ts — update CurrentSubscriptionSchema
export const CurrentSubscriptionSchema = z.object({
    id: z.string(),
    status: z.string(),
    billing_cycle: z.string().nullable().optional(),
    started_at: z.string().nullable().optional(),
    current_period_ends_at: z.string().nullable().optional(),
    trial_ends_at: z.string().nullable().optional(),
    plan_id: z.string(),
    plan_name: z.string(),
    plan_code: z.string(),
    // ✅ sesuaikan dengan struktur actual dari backend
    price_monthly: z.number().nullable().optional(),
    price_yearly: z.number().nullable().optional(),
    max_branches: z.number().nullable().optional(),
    description: z.string().nullable().optional(),
}).nullable(); // ✅ bisa null

export const SubscriptionHistorySchema = z.object({
    id: z.string(),
    status: z.string(),
    billing_cycle: z.string().nullable().optional(),
    started_at: z.string().nullable().optional(),
    current_period_ends_at: z.string().nullable().optional(),
    plan_name: z.string(),
    plan_code: z.string(),
});

export type CurrentSubscriptionData = z.infer<typeof CurrentSubscriptionSchema>;
export type SubscriptionHistoryData = z.infer<typeof SubscriptionHistorySchema>;