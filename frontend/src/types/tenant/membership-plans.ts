import * as z from "zod";

/* =========================
 * ENUMS
 * ========================= */

export const MembershipPlanAccessTypeEnum = z.enum(["all_branches", "single_branch"]);
export const DurationUnitEnum = z.enum(["day", "week", "month", "year"]);

/* =========================
 * CHECKIN SCHEDULE
 * ========================= */

export const CheckinScheduleDaySchema = z.object({
    is_open: z.boolean(),
    open: z.string(), // "06:00"
    close: z.string(), // "22:00"
});

export const CheckinScheduleSchema = z.object({
    mon: CheckinScheduleDaySchema,
    tue: CheckinScheduleDaySchema,
    wed: CheckinScheduleDaySchema,
    thu: CheckinScheduleDaySchema,
    fri: CheckinScheduleDaySchema,
    sat: CheckinScheduleDaySchema,
    sun: CheckinScheduleDaySchema,
});

export type CheckinSchedule = z.infer<typeof CheckinScheduleSchema>;
export type CheckinScheduleDay = z.infer<typeof CheckinScheduleDaySchema>;

/* =========================
 * MEMBERSHIP PLAN SCHEMA
 * ========================= */

export const MembershipPlanSchema = z.object({
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

    loyalty_points_reward: z.number().default(0),
    max_sharing_members: z.number().default(0),

    branch_id: z.string().nullable().optional(),
    access_type: MembershipPlanAccessTypeEnum,

    unlimited_checkin: z.boolean(),
    checkin_quota_per_month: z.number().nullable().optional(),

    unlimited_sold: z.boolean(),
    total_quota: z.number().nullable().optional(),
    sold_count: z.number().optional(),
    remaining_quota: z.number().nullable().optional(),
    has_stock: z.boolean().optional(),

    always_available: z.boolean(),
    available_from: z.string().nullable().optional(),
    available_until: z.string().nullable().optional(),
    is_available: z.boolean().optional(),

    checkin_schedule: CheckinScheduleSchema.nullable().optional(),

    is_active: z.boolean(),
    created_at: z.string().optional(),

    class_plans: z.array(z.any()).optional(),
});

export type MembershipPlanData = z.infer<typeof MembershipPlanSchema>;
export type MembershipPlanWithKeyword = MembershipPlanData & { search: string };

/* =========================
 * CREATE REQUEST
 * ========================= */

export const MembershipPlanCreateRequestSchema = z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    description: z.string().optional(),
    color: z.string().optional(),
    sort_order: z.number().optional(),
    price: z.number().min(0),
    currency: z.string().optional(),
    duration: z.number().min(1),
    duration_unit: DurationUnitEnum,
    loyalty_points_reward: z.number().optional(),
    max_sharing_members: z.number().optional(),
    branch_id: z.string().optional(),
    access_type: MembershipPlanAccessTypeEnum.optional(),
    unlimited_checkin: z.boolean().optional(),
    checkin_quota_per_month: z.number().optional(),
    unlimited_sold: z.boolean().optional(),
    total_quota: z.number().optional(),
    always_available: z.boolean().optional(),
    available_from: z.string().optional(),
    available_until: z.string().optional(),
    checkin_schedule: CheckinScheduleSchema.optional(),
    is_active: z.boolean().optional(),
    class_plan_ids: z.array(z.string()).optional(),
});

export type MembershipPlanCreateRequest = z.infer<typeof MembershipPlanCreateRequestSchema>;
export type MembershipPlanUpdateRequest = Partial<MembershipPlanCreateRequest>;

/* =========================
 * DEFAULT CHECKIN SCHEDULE
 * ========================= */

export const DEFAULT_CHECKIN_SCHEDULE: CheckinSchedule = {
    mon: { is_open: true, open: "00:00", close: "23:59" },
    tue: { is_open: true, open: "00:00", close: "23:59" },
    wed: { is_open: true, open: "00:00", close: "23:59" },
    thu: { is_open: true, open: "00:00", close: "23:59" },
    fri: { is_open: true, open: "00:00", close: "23:59" },
    sat: { is_open: true, open: "00:00", close: "23:59" },
    sun: { is_open: true, open: "00:00", close: "23:59" },
};
