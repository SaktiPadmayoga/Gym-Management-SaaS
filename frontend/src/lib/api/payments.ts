import tenantApiClient from "@/lib/tenant-api-client";
import apiClient from "@/lib/api-client";

import { PaymentData, PaymentDetailData } from "@/types/central/payments";


export type CreateTokenPayload = {
    plan_id: string;
    billing_cycle: "monthly" | "yearly";
};

export type CreateTokenResponse = {
    snap_token: string;
    order_id: string;
    invoice_number: string;
    amount: number;
    client_key: string;
};

export type PaymentsParams = {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
};

export type PaymentsResponse = {
    data: PaymentData[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
};

export const paymentsAPI = {
    createToken: async (payload: CreateTokenPayload): Promise<CreateTokenResponse> => {
        const res = await tenantApiClient.post("/payment/token", payload);
        return res.data.data;
    },

        getAll: async (params: PaymentsParams): Promise<PaymentsResponse> => {
        const res = await apiClient.get("/payments", { params });
        return res.data;
    },

    getOne: async (id: string): Promise<PaymentDetailData> => {
        const res = await apiClient.get(`/payments/${id}`);
        return res.data.data;
    },
};