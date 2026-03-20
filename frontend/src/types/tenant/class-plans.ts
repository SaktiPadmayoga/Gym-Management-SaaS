import * as z from "zod";

/* =========================
 * ENUMS
 * ========================= */

export const ClassPlanAccessTypeEnum = z.enum(["all_branches", "single_branch"]);

/* =========================
 * SCHEMA
 * ========================= */

export const ClassPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    sort_order: z.number().default(0),

    price: z.string().or(z.number()),
    currency: z.string().default("IDR"),

    max_capacity: z.number(),
    minutes_per_session: z.number(),
    duration_label: z.string().optional(),

    branch_id: z.string().nullable().optional(),
    access_type: ClassPlanAccessTypeEnum,

    unlimited_monthly_session: z.boolean(),
    monthly_quota: z.number().nullable().optional(),
    unlimited_daily_session: z.boolean(),
    daily_quota: z.number().nullable().optional(),

    always_available: z.boolean(),
    available_from: z.string().nullable().optional(),
    available_until: z.string().nullable().optional(),
    is_available: z.boolean().optional(),

    is_active: z.boolean(),
    created_at: z.string().optional(),
});

export type ClassPlanData = z.infer<typeof ClassPlanSchema>;
export type ClassPlanDataWithKeyword = ClassPlanData & { search: string };

/* =========================
 * CREATE REQUEST
 * ========================= */

export const ClassPlanCreateRequestSchema = z.object({
    name: z.string().min(1),
    category: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    sort_order: z.number().optional(),
    price: z.number().min(0),
    currency: z.string().optional(),
    max_capacity: z.number().min(1),
    minutes_per_session: z.number().min(1),
    branch_id: z.string().optional(),
    access_type: ClassPlanAccessTypeEnum.optional(),
    unlimited_monthly_session: z.boolean().optional(),
    monthly_quota: z.number().optional(),
    unlimited_daily_session: z.boolean().optional(),
    daily_quota: z.number().optional(),
    always_available: z.boolean().optional(),
    available_from: z.string().optional(),
    available_until: z.string().optional(),
    is_active: z.boolean().optional(),
    membership_plan_ids: z.array(z.string()).optional(),
});

export type ClassPlanCreateRequest = z.infer<typeof ClassPlanCreateRequestSchema>;
export type ClassPlanUpdateRequest = Partial<ClassPlanCreateRequest>;
