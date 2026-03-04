import * as z from "zod";

export const PaymentSchema = z.object({
    id: z.string(),
    order_id: z.string(),
    provider: z.string(),
    payment_type: z.string().nullable().optional(),
    transaction_id: z.string().nullable().optional(),
    gross_amount: z.number(),
    status: z.string(),
    paid_at: z.string().nullable().optional(),
    created_at: z.string(),
    invoice_number: z.string(),
    currency: z.string().nullable().optional(),
    tenant_name: z.string(),
    tenant_slug: z.string(),
});

export const PaymentDetailSchema = PaymentSchema.extend({
    raw_response: z.string().nullable().optional(),
    invoice_id: z.string(),
    invoice_amount: z.number(),
    invoice_status: z.string(),
    issued_at: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
    tenant_id: z.string(),
    plan_name: z.string().nullable().optional(),
    plan_code: z.string().nullable().optional(),
});

export type PaymentData = z.infer<typeof PaymentSchema>;
export type PaymentDetailData = z.infer<typeof PaymentDetailSchema>;