import * as z from "zod";

export const AccessTypeEnum = z.enum(["regular", "premium"]);

export const ClassPlanSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    price: z.number().nonnegative(),
    description: z.string().optional(),
    maxVisitor: z.number().int().min(0),
    accessType: AccessTypeEnum,
    minutesPerSession: z.number().int().min(0),

    sessionSetting: z.object({
        unlimitedMonthlySession: z.boolean(),
        unlimitedDailySession: z.boolean(),

        monthlyQuota: z.number().int().optional(),
        dailyQuota: z.number().int().optional(),
    }),
});

export type ClassPlanData = z.infer<typeof ClassPlanSchema>;
export type ClassPlanDataWithKeyword = z.infer<typeof ClassPlanSchema> & { keyword: string };
