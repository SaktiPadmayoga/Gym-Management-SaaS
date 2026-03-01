import * as z from "zod";

export const DurationUnitEnum = z.enum(["day", "week", "month", "year"]);

export const PTSessionPlanSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    duration: z.number().int().positive(),
    durationUnit: DurationUnitEnum,
    price: z.number().nonnegative(),
    description: z.string().optional(),
    minutesPerSession: z.number().int().min(0),
    loyaltyPoint: z.number().int().min(0),
    category: z.string().min(1),

    availabilitySetting: z.object({
        unlimitedSold: z.boolean(),
        quota: z.number().int().optional(),

        alwaysAvailable: z.boolean(),
        availableFrom: z.string().optional(), // YYYY-MM-DD
        availableUntil: z.string().optional(),
    }),
});

export type PTSessionPlanData = z.infer<typeof PTSessionPlanSchema>;
export type PTSessionPlanDataWithKeyword = z.infer<typeof PTSessionPlanSchema> & { keyword: string };
