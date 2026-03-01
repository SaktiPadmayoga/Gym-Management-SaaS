import tenantApiClient from "@/lib/tenant-api-client";
import apiClient from "@/lib/api-client";
import { CurrentSubscriptionData, SubscriptionHistoryData } from "@/types/central/subscriptions-tenant";

export const subscriptionTenantAPI = {
    getCurrent: async (): Promise<CurrentSubscriptionData | null> => {
    try {
        const res = await tenantApiClient.get("/subscription/current");
        return res.data.data;
    } catch (err: any) {
        if (err?.response?.status === 404) return null; // ✅ return null bukan undefined
        throw err;
    }
},

    getHistory: async (): Promise<SubscriptionHistoryData[]> => {
        const res = await tenantApiClient.get("/subscription/history");
        return res.data.data;
    },

    getPlans: async () => {
    const res = await apiClient.get("/plans", { params: { per_page: 100 } });
    // ✅ filter trial di sini
    return res.data.data.filter((plan: any) => 
        plan.code !== "TRIAL" && plan.code !== "trial"
    );
},
};