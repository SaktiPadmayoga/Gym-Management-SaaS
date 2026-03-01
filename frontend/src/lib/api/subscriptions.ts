import apiClient from "@/lib/api-client";
import { SubscriptionsData, SubscriptionCreateRequest } from "@/types/central/subscriptions";

export const subscriptionsAPI = {
    getAll: async (params?: { page?: number; per_page?: number; search?: string }): Promise<SubscriptionsData[]> => {
        const response = await apiClient.get("/subscriptions", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
            },
        });

        return response?.data?.data ?? response?.data ?? [];
    },

    getById: async (id: string): Promise<SubscriptionsData> => {
        const response = await apiClient.get(`/subscriptions/${id}`);
        return response?.data?.data ?? response?.data;
    },

    create: async (payload: SubscriptionCreateRequest): Promise<SubscriptionsData> => {
        const response = await apiClient.post("/subscriptions", payload);
        return response?.data?.data ?? response?.data;
    },

    update: async (id: string, payload: Partial<SubscriptionsData>): Promise<SubscriptionsData> => {
        const response = await apiClient.put(`/subscriptions/${id}`, payload);
        return response?.data?.data ?? response?.data;
    },

    cancel: async (id: string): Promise<SubscriptionsData> => {
        const response = await apiClient.patch(`/subscriptions/${id}/cancel`);
        return response?.data?.data ?? response?.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/subscriptions/${id}`);
    },
};
