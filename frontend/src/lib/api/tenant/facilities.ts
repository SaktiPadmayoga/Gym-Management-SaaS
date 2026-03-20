import tenantApiClient from "@/lib/tenant-api-client";
import { FacilityCreateRequest, FacilityData, FacilityUpdateRequest } from "@/types/tenant/facilities";

export const facilitiesAPI = {
    getAll: async (params?: { page?: number; per_page?: number; search?: string; category?: string; access_type?: string; is_active?: boolean; available_only?: boolean }): Promise<FacilityData[]> => {
        const response = await tenantApiClient.get("/facilities", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
                ...(params?.category && { category: params.category }),
                ...(params?.access_type && { access_type: params.access_type }),
                ...(params?.is_active !== undefined && { is_active: params.is_active }),
                ...(params?.available_only && { available_only: true }),
            },
        });
        return response?.data.data.data ?? [];
    },

    getById: async (id: string): Promise<FacilityData> => {
        const response = await tenantApiClient.get(`/facilities/${id}`);
        return response?.data.data;
    },

    getCategories: async (): Promise<string[]> => {
        const response = await tenantApiClient.get("/facilities/categories");
        return response?.data.data ?? [];
    },

    create: async (payload: FacilityCreateRequest): Promise<FacilityData> => {
        const response = await tenantApiClient.post("/facilities", payload);
        return response?.data.data;
    },

    update: async (id: string, payload: FacilityUpdateRequest): Promise<FacilityData> => {
        const response = await tenantApiClient.put(`/facilities/${id}`, payload);
        return response?.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await tenantApiClient.delete(`/facilities/${id}`);
    },

    toggleActive: async (id: string): Promise<FacilityData> => {
        const response = await tenantApiClient.patch(`/facilities/${id}/toggle-active`);
        return response?.data.data;
    },
};
