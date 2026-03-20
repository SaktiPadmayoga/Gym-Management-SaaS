import * as z from "zod";

/* =========================
 * OPERATIONAL HOURS
 * ========================= */

export const OperationalHoursDaySchema = z.object({
    is_open: z.boolean(),
    open: z.string(),
    close: z.string(),
});

export const OperationalHoursSchema = z.object({
    mon: OperationalHoursDaySchema,
    tue: OperationalHoursDaySchema,
    wed: OperationalHoursDaySchema,
    thu: OperationalHoursDaySchema,
    fri: OperationalHoursDaySchema,
    sat: OperationalHoursDaySchema,
    sun: OperationalHoursDaySchema,
});

export type OperationalHours = z.infer<typeof OperationalHoursSchema>;
export type OperationalHoursDay = z.infer<typeof OperationalHoursDaySchema>;

export const DEFAULT_OPERATIONAL_HOURS: OperationalHours = {
    mon: { is_open: true, open: "06:00", close: "22:00" },
    tue: { is_open: true, open: "06:00", close: "22:00" },
    wed: { is_open: true, open: "06:00", close: "22:00" },
    thu: { is_open: true, open: "06:00", close: "22:00" },
    fri: { is_open: true, open: "06:00", close: "22:00" },
    sat: { is_open: true, open: "07:00", close: "20:00" },
    sun: { is_open: false, open: "07:00", close: "18:00" },
};

/* =========================
 * FACILITY SCHEMA
 * ========================= */

export const FacilitySchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    sort_order: z.number().default(0),

    price: z.string().or(z.number()),
    currency: z.string().default("IDR"),

    minutes_per_session: z.number(),
    duration_label: z.string().optional(),
    capacity: z.number(),
    access_type: z.enum(["public", "private"]),

    branch_id: z.string().nullable().optional(),
    operational_hours: OperationalHoursSchema.nullable().optional(),

    always_available: z.boolean(),
    available_from: z.string().nullable().optional(),
    available_until: z.string().nullable().optional(),
    is_available: z.boolean().optional(),

    is_active: z.boolean(),
    created_at: z.string().optional(),
});

export type FacilityData = z.infer<typeof FacilitySchema>;
export type FacilityDataWithKeyword = FacilityData & { search: string };

/* =========================
 * CREATE REQUEST
 * ========================= */

export const FacilityCreateRequestSchema = z.object({
    name: z.string().min(1),
    category: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    sort_order: z.number().optional(),
    price: z.number().min(0),
    currency: z.string().optional(),
    minutes_per_session: z.number().min(1),
    capacity: z.number().min(1),
    access_type: z.enum(["public", "private"]).optional(),
    branch_id: z.string().optional(),
    operational_hours: OperationalHoursSchema.optional(),
    always_available: z.boolean().optional(),
    available_from: z.string().optional(),
    available_until: z.string().optional(),
    is_active: z.boolean().optional(),
});

export type FacilityCreateRequest = z.infer<typeof FacilityCreateRequestSchema>;
export type FacilityUpdateRequest = Partial<FacilityCreateRequest>;
