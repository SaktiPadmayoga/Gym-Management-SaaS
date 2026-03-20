import tenantApiClient from "@/lib/tenant-api-client";
import { PtSessionPlanCreateRequest, PtSessionPlanData, PtSessionPlanUpdateRequest } from "@/types/tenant/pt-session-plans";

export const ptSessionPlansAPI = {
    getAll: async (params?: { page?: number; per_page?: number; search?: string; category?: string; is_active?: boolean; available_only?: boolean }): Promise<PtSessionPlanData[]> => {
        const response = await tenantApiClient.get("/pt-session-plans", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
                ...(params?.category && { category: params.category }),
                ...(params?.is_active !== undefined && { is_active: params.is_active }),
                ...(params?.available_only && { available_only: true }),
            },
        });
        return response?.data.data.data ?? [];
    },

    getById: async (id: string): Promise<PtSessionPlanData> => {
        const response = await tenantApiClient.get(`/pt-session-plans/${id}`);
        return response?.data.data;
    },

    getCategories: async (): Promise<string[]> => {
        const response = await tenantApiClient.get("/pt-session-plans/categories");
        return response?.data.data ?? [];
    },

    create: async (payload: PtSessionPlanCreateRequest): Promise<PtSessionPlanData> => {
        const response = await tenantApiClient.post("/pt-session-plans", payload);
        return response?.data.data;
    },

    update: async (id: string, payload: PtSessionPlanUpdateRequest): Promise<PtSessionPlanData> => {
        const response = await tenantApiClient.put(`/pt-session-plans/${id}`, payload);
        return response?.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await tenantApiClient.delete(`/pt-session-plans/${id}`);
    },

    toggleActive: async (id: string): Promise<PtSessionPlanData> => {
        const response = await tenantApiClient.patch(`/pt-session-plans/${id}/toggle-active`);
        return response?.data.data;
    },

    duplicate: async (id: string): Promise<PtSessionPlanData> => {
        const response = await tenantApiClient.post(`/pt-session-plans/${id}/duplicate`);
        return response?.data.data;
    },
};
