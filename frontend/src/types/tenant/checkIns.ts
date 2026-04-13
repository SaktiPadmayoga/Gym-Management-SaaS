import * as z from "zod";

/* =========================
 * ENUMS
 * ========================= */
export const CheckInStatusEnum = z.enum(["success", "failed"]);

/* =========================
 * CHECK-IN SCHEMA
 * (Sesuai dengan CheckInResource Backend)
 * ========================= */
export const CheckInSchema = z.object({
    id: z.string(),
    checked_in_at: z.string(),
    status: CheckInStatusEnum,
    notes: z.string().nullable().optional(),
    
    // Relasi Member yang disederhanakan
    member: z.object({
        id: z.string(),
        name: z.string(),
        avatar: z.string().nullable().optional(),
    }).nullable().optional(),

    // Relasi Paket yang dipakai saat check-in
    membership: z.object({
        plan_name: z.string(),
        end_date: z.string().nullable().optional(),
        is_unlimited: z.boolean(),
        remaining_quota: z.number().nullable().optional(),
    }).nullable().optional(),
});

export type CheckInData = z.infer<typeof CheckInSchema>;

/* =========================
 * REQUEST PAYLOADS
 * ========================= */
export type CheckInCreateRequest = {
    qr_token: string;
    branch_id: string;
};