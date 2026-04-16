import * as z from "zod";

export const MembershipDetailSchema = z.object({
    id: z.string(),
    member_id: z.string(),
    membership_plan_id: z.string(),
    branch_id: z.string().nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    status: z.enum(["active", "expired", "cancelled", "frozen"]),
    status_label: z.string().optional(),
    status_color: z.string().optional(),
    unlimited_checkin: z.boolean(),
    remaining_checkin_quota: z.number().nullable().optional(),
    total_checkins: z.number().default(0),
    frozen_until: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    created_at: z.string().optional(),
    days_remaining: z.number().nullable().optional(),
    is_expired: z.boolean().optional(),
    is_frozen: z.boolean().optional(),
    member: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        avatar: z.string().nullable().optional(),
    }).optional(),
    plan: z.object({
        id: z.string(),
        name: z.string(),
        duration: z.number().optional(),
        duration_unit: z.string().optional(),
        price: z.union([z.string(), z.number()]).optional(),
        unlimited_checkin: z.boolean().optional(),
    }).optional(),
    branch: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable().optional(),
});

export type MembershipDetail = z.infer<typeof MembershipDetailSchema>;

export type MembershipsQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    branch_id?: string;
    expiring_in_days?: number;
};