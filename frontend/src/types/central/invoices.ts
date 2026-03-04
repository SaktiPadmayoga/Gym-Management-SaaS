import * as z from "zod";

export const InvoiceSchema = z.object({
    id: z.string(),
    invoice_number: z.string(),
    external_reference: z.string().nullable().optional(),
    amount: z.number(),
    currency: z.string(),
    payment_gateway: z.string(),
    payment_method: z.string().nullable().optional(),
    transaction_id: z.string().nullable().optional(),
    status: z.string(),
    issued_at: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
    paid_at: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    created_at: z.string(),
    tenant_id: z.string(),
    tenant_name: z.string(),
    tenant_slug: z.string(),
    plan_name: z.string().nullable().optional(),
    plan_code: z.string().nullable().optional(),
});

export const InvoiceDetailSchema = InvoiceSchema.extend({
    gateway_response: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
    tenant_email: z.string().nullable().optional(),
    subscription_id: z.string().nullable().optional(),
    billing_cycle: z.string().nullable().optional(),
    subscription_status: z.string().nullable().optional(),
    payment_id: z.string().nullable().optional(),
    payment_status: z.string().nullable().optional(),
    payment_type: z.string().nullable().optional(),
    order_id: z.string().nullable().optional(),
    gross_amount: z.number().nullable().optional(),
    payment_transaction_id: z.string().nullable().optional(),
    payment_paid_at: z.string().nullable().optional(),
});

export type InvoiceData = z.infer<typeof InvoiceSchema>;
export type InvoiceDetailData = z.infer<typeof InvoiceDetailSchema>;