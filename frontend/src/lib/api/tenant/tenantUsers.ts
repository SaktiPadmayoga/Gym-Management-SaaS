import apiClient from "@/lib/api-client";
import {
    TenantUserCreateRequest,
    TenantUserData,
    TenantUserUpdateRequest,
} from "@/types/tenant/tenant-users";

export const tenantUsersAPI = {
    getAll: async (params?: { page?: number; per_page?: number; search?: string }): Promise<TenantUserData[]> => {
        const response = await apiClient.get("/tenant/users", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
            },
        });

        return response?.data ?? [];
    },

    getById: async (id: string): Promise<TenantUserData> => {
        const response = await apiClient.get(`/tenant/users/${id}`);
        return response?.data;
    },

    create: async (payload: TenantUserCreateRequest): Promise<TenantUserData> => {
        const response = await apiClient.post("/tenant/users", payload);
        return response?.data;
    },

    update: async (id: string, payload: TenantUserUpdateRequest): Promise<TenantUserData> => {
        const response = await apiClient.put(`/tenant/users/${id}`, payload);
        return response?.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/tenant/users/${id}`);
    },
};