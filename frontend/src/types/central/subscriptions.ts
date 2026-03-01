import * as z from "zod";

export const StatusEnum = z.enum(["trial", "active", "past_due", "cancelled", "expired"]);
export const BillingCycleEnum = z.enum(["monthly", "yearly"]);

export const SubscriptionsSchema = z.object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    tenantName: z.string().optional(),
    planId: z.string().min(1),
    planName: z.string().optional(),
    status: StatusEnum,

    startedAt: z.date().optional(),
    trialEndsAt: z.date().optional(),
    currentPeriodEndsAt: z.date().optional(),

    billingCycle: BillingCycleEnum,
    amount: z.number().int().min(0),
    autoRenew: z.boolean().default(false),

    lastInvoiceId: z.string().optional(),
    canceledAt: z.date().optional(),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    deletedAt: z.date().optional(),
});

export type SubscriptionsData = z.infer<typeof SubscriptionsSchema>;
export type SubscriptionsDataWithKeyword = SubscriptionsData & { keyword: string };

export type SubscriptionCreateRequest = Omit<SubscriptionsData, "id" | "createdAt" | "updatedAt" | "deletedAt">;
