import tenantApiClient from "@/lib/tenant-api-client";
import { ClassPlanCreateRequest, ClassPlanData, ClassPlanUpdateRequest } from "@/types/tenant/class-plans";

export const classPlansAPI = {
    getAll: async (params?: { page?: number; per_page?: number; search?: string; category?: string; is_active?: boolean; available_only?: boolean }): Promise<ClassPlanData[]> => {
        const response = await tenantApiClient.get("/class-plans", {
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

    getById: async (id: string): Promise<ClassPlanData> => {
        const response = await tenantApiClient.get(`/class-plans/${id}`);
        return response?.data.data;
    },

    getCategories: async (): Promise<string[]> => {
        const response = await tenantApiClient.get("/class-plans/categories");
        return response?.data.data ?? [];
    },

    create: async (payload: ClassPlanCreateRequest): Promise<ClassPlanData> => {
        const response = await tenantApiClient.post("/class-plans", payload);
        return response?.data.data;
    },

    update: async (id: string, payload: ClassPlanUpdateRequest): Promise<ClassPlanData> => {
        const response = await tenantApiClient.put(`/class-plans/${id}`, payload);
        return response?.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await tenantApiClient.delete(`/class-plans/${id}`);
    },

    toggleActive: async (id: string): Promise<ClassPlanData> => {
        const response = await tenantApiClient.patch(`/class-plans/${id}/toggle-active`);
        return response?.data.data;
    },

    duplicate: async (id: string): Promise<ClassPlanData> => {
        const response = await tenantApiClient.post(`/class-plans/${id}/duplicate`);
        return response?.data.data;
    },
};
