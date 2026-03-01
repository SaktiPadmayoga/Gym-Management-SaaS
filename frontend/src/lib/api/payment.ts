import tenantApiClient from "@/lib/tenant-api-client";

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

export const paymentAPI = {
    createToken: async (payload: CreateTokenPayload): Promise<CreateTokenResponse> => {
        const res = await tenantApiClient.post("/payment/token", payload);
        return res.data.data;
    },
};