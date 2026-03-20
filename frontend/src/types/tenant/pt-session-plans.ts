import * as z from "zod";

/* =========================
 * ENUMS
 * ========================= */

export const DurationUnitEnum = z.enum(["day", "week", "month", "year"]);

/* =========================
 * SCHEMA
 * ========================= */

export const PtSessionPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    description: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    sort_order: z.number().default(0),

    price: z.string().or(z.number()),
    currency: z.string().default("IDR"),
    duration: z.number(),
    duration_unit: DurationUnitEnum,
    duration_label: z.string().optional(),

    minutes_per_session: z.number(),
    total_sessions: z.number(),
    loyalty_points_reward: z.number().default(0),

    branch_id: z.string().nullable().optional(),

    unlimited_sold: z.boolean(),
    total_quota: z.number().nullable().optional(),
    sold_count: z.number().optional(),
    remaining_quota: z.number().nullable().optional(),
    has_stock: z.boolean().optional(),

    always_available: z.boolean(),
    available_from: z.string().nullable().optional(),
    available_until: z.string().nullable().optional(),
    is_available: z.boolean().optional(),

    is_active: z.boolean(),
    created_at: z.string().optional(),
});

export type PtSessionPlanData = z.infer<typeof PtSessionPlanSchema>;
export type PtSessionPlanWithKeyword = PtSessionPlanData & { search: string };

/* =========================
 * CREATE REQUEST
 * ========================= */

export const PtSessionPlanCreateRequestSchema = z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    description: z.string().optional(),
    color: z.string().optional(),
    sort_order: z.number().optional(),
    price: z.number().min(0),
    currency: z.string().optional(),
    duration: z.number().min(1),
    duration_unit: DurationUnitEnum,
    minutes_per_session: z.number().min(1),
    total_sessions: z.number().min(1),
    loyalty_points_reward: z.number().optional(),
    branch_id: z.string().optional(),
    unlimited_sold: z.boolean().optional(),
    total_quota: z.number().optional(),
    always_available: z.boolean().optional(),
    available_from: z.string().optional(),
    available_until: z.string().optional(),
    is_active: z.boolean().optional(),
});

export type PtSessionPlanCreateRequest = z.infer<typeof PtSessionPlanCreateRequestSchema>;
export type PtSessionPlanUpdateRequest = Partial<PtSessionPlanCreateRequest>;
