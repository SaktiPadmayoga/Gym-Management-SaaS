import apiClient from "@/lib/api-client";

// --- TYPES ---
export type RegisterPaidPayload = {
    tenant_name: string;
    slug: string;
    owner_name: string;
    owner_email: string;
    password: string;
    timezone: string;
    city: string;
    phone?: string;
    plan_id: string;
    billing_cycle: "monthly" | "yearly";
};

export type RegisterPaidResponse = {
    snap_token: string;
    order_id: string;
    tenant_domain: string;
    client_key: string;
};

export type RegisterTrialPayload = {
    tenant_name: string;
    slug: string;
    owner_name: string;
    owner_email: string;
    password: string;
    timezone: string;
    city: string;
    phone?: string;
};



// --- API FETCHERS ---
export const authAPI = {
    /**
     * POST /api/auth/register-paid
     * Mendaftarkan tenant baru dan mengembalikan token Midtrans
     */
    registerPaid: async (payload: RegisterPaidPayload): Promise<RegisterPaidResponse> => {
        const res = await apiClient.post("/auth/register-paid", payload);
        return res.data.data; 
    },

    registerTrial: async (payload: RegisterTrialPayload) => {
    const res = await apiClient.post("/auth/register-trial", payload);
    return res.data.data; 
}

};