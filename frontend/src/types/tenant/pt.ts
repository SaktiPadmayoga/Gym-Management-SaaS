import * as z from "zod";

// ENUMS
export const PtPackageStatusEnum = z.enum(["pending", "active", "completed", "expired", "cancelled"]);
export const PtSessionStatusEnum = z.enum(["scheduled", "ongoing", "completed", "cancelled"]);

// SCHEMAS
export const PtSessionPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    description: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    price: z.number().or(z.string()),
    total_sessions: z.number(),
    minutes_per_session: z.number(),
    duration: z.number(),
    duration_unit: z.string(),
    is_active: z.boolean(),
});

export const PtPackageSchema = z.object({
    id: z.string(),
    member_id: z.string(),
    pt_session_plan_id: z.string(),
    tenant_invoice_id: z.string().nullable().optional(),
    total_sessions: z.number(),
    used_sessions: z.number(),
    remaining_sessions: z.number().optional(), // Injected by backend accessor
    status: PtPackageStatusEnum,
    purchased_at: z.string(),
    activated_at: z.string().nullable().optional(),
    expired_at: z.string().nullable().optional(),
    plan: PtSessionPlanSchema.optional(),
    invoice: z.object({
        id: z.string(),
        invoice_number: z.string(),
        status: z.string(),
    }).optional(),
});

// EXPORT TYPES
export type PtSessionPlanData = z.infer<typeof PtSessionPlanSchema>;
export type PtPackageData = z.infer<typeof PtPackageSchema>;

export type PurchasePtPackageResponse = {
    data: {
        package?: PtPackageData;
        invoice?: {
            id: string;
            invoice_number: string;
            total_amount: number;
            due_date: string;
        };
        snap_token?: string;
    };
    message?: string;
};

// Tambahkan di file @/types/tenant/pt.ts yang sudah ada

export const PtSessionSchema = z.object({
    id: z.string(),
    pt_package_id: z.string(),
    member_id: z.string(),
    trainer_id: z.string(),
    branch_id: z.string(),
    date: z.string(),
    start_at: z.string(),
    end_at: z.string(),
    status: PtSessionStatusEnum,
    notes: z.string().nullable().optional(),
    cancelled_reason: z.string().nullable().optional(),
    
    // Relasi
    package: PtPackageSchema.optional(),
    member: z.object({
        id: z.string(),
        name: z.string(),
        phone: z.string().nullable().optional(),
    }).optional(),
    trainer: z.object({
        id: z.string(),
        name: z.string(),
    }).optional(),
});

export type PtSessionData = z.infer<typeof PtSessionSchema>;

export type PtSessionQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    date?: string;
    status?: string;
    trainer_id?: string;
    member_id?: string;
};

export type PtSessionCreateRequest = {
    pt_package_id: string;
    trainer_id: string;
    date: string;
    start_at: string;
    end_at: string;
    notes?: string;
};

export type PtSessionUpdateRequest = Partial<PtSessionCreateRequest> & {
    status?: z.infer<typeof PtSessionStatusEnum>;
    cancelled_reason?: string;
};