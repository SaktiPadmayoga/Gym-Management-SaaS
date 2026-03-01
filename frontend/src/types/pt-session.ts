import * as z from "zod";

/* =======================
   PT SESSION SCHEMA
======================= */
export const ptSessionSchema = z.object({
    id: z.string(),

    /** RELATION */
    ptSessionPlanId: z.string(), // relasi ke PT Session Plan
    memberProfileId: z.string(), // relasi ke Profile
    ptId: z.string(), // relasi ke Personal Trainer
    additionalFeeId: z.string().optional(),

    /** TRANSACTION */
    joinDate: z.string(), // YYYY-MM-DD
    referralSalesId: z.string().optional(),
    salesType: z.string(),

    /** DISCOUNT */
    discountAmount: z.number(),
    discountPercent: z.number(),

    /** BONUS */
    extraDurationDay: z.number(),
    extraSession: z.number(),

    /** NOTE */
    simpleNote: z.string().optional(),

    /** STATUS */
    ptSessionStatus: z.enum(["Active", "Expired", "Suspended"]),
});

/* =======================
   TYPES
======================= */
export type PtSessionData = z.infer<typeof ptSessionSchema>;

export type PtSessionDataWithKeyword = PtSessionData & {
    keyword: string;
};
