import { TenantsQueryParams } from "@/hooks/useTenants";
import apiClient from "@/lib/api-client";
import { TenantCreateRequest, TenantsData } from "@/types/central/tenants";
import { TenantsPaginatedResponse } from "@/types/central/tenants";

export const tenantsAPI = {
        getAll: async (params?: TenantsQueryParams): Promise<TenantsPaginatedResponse> => {
        const res = await apiClient.get("/tenants", { params });
        return res.data;
    },

    

    getById: async (id: string): Promise<TenantsData> => {
        const res = await apiClient.get(`/tenants/${id}`);
        return res.data.data;
    },

    create: async (payload: TenantCreateRequest): Promise<TenantsData> => {
        console.log("CREATE PAYLOAD:", payload);
        const res = await apiClient.post("/tenants", payload);
        return res.data.data; // ✅ jangan pakai response?.data ?? response
    },

    update: async (id: string, payload: Partial<TenantCreateRequest>): Promise<TenantsData> => {
        const res = await apiClient.put(`/tenants/${id}`, payload);
        return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/tenants/${id}`);
    },

    restore: async (id: string): Promise<TenantsData> => {
        const res = await apiClient.post(`/tenants/${id}/restore`);
        return res.data.data;
    },
};
