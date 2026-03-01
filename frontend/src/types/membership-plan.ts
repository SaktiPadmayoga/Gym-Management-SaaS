import * as z from "zod";

export const DurationUnitEnum = z.enum(["day", "week", "month", "year"]);
export const AccessTypeEnum = z.enum(["all_club", "single_club"]);
export const ClassAccessTypeEnum = z.enum(["all_classes", "premium_class_only", "regular_class_only", "no_access_to_all_classes"]);

export const CheckinDaySchema = z.object({
    enabled: z.boolean(),
    startAt: z.string(), // HH:mm
    endAt: z.string(), // HH:mm
});

export const MembershipPlanSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),

    duration: z.number().int().positive(),
    durationUnit: DurationUnitEnum,

    price: z.number().nonnegative(),
    description: z.string().optional(),

    maxSharingAccess: z.number().int().min(0),
    loyaltyPoint: z.number().int().min(0),

    /** 🔥 DINAMIS */
    category: z.string().min(1),

    checkinSetting: z.object({
        accessType: AccessTypeEnum,
        classAccessType: ClassAccessTypeEnum,

        unlimitedCheckinMembership: z.boolean(),
        unlimitedCheckinClass: z.boolean(),

        membershipQuota: z.number().int().optional(),
        classQuota: z.number().int().optional(),
    }),

    availabilitySetting: z.object({
        unlimitedSold: z.boolean(),
        quota: z.number().int().optional(),

        alwaysAvailable: z.boolean(),
        availableFrom: z.string().optional(), // YYYY-MM-DD
        availableUntil: z.string().optional(),
    }),

    checkinSchedule: z.object({
        monday: CheckinDaySchema,
        tuesday: CheckinDaySchema,
        wednesday: CheckinDaySchema,
        thursday: CheckinDaySchema,
        friday: CheckinDaySchema,
        saturday: CheckinDaySchema,
        sunday: CheckinDaySchema,
    }),
});

export type MembershipPlanData = z.infer<typeof MembershipPlanSchema>;
export type MembershipPlanDataWithKeyword = z.infer<typeof MembershipPlanSchema> & { keyword: string };
