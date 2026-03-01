import * as z from "zod";

export const MembershipSchema = z.object({
    id: z.string(),

    membershipPlanId: z.string(), // Membership Plan *
    memberProfileId: z.string(), // Member Profile *

    additionalFeeId: z.string().optional(),

    joinDate: z.string(), // Join Date / Start Date *

    referralSalesId: z.string().optional(),
    salesType: z.string(),

    discountAmount: z.number().min(0), // Rp
    discountPercent: z.number().min(0).max(100), // %

    extraDurationDay: z.number().min(0),
    extraMembershipSession: z.number().min(0),

    simpleNote: z.string().optional(),

    membershipStatus: z.enum(["Active", "Inactive", "Expired", "Suspended"]),
});

export type MembershipData = z.infer<typeof MembershipSchema>;
export type MembershipDataWithKeyword = z.infer<typeof MembershipSchema> & {
    keyword: string;
};
