import apiClient from "@/lib/api-client";
import { AdminCreateRequest, AdminData, AdminUpdateRequest } from "@/types/central/admins";

export const adminsAPI = {
    getAll: async (params?: { page?: number; per_page?: number; search?: string }): Promise<any> => {
        const response = await apiClient.get("/admin/admins", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
            },
        });

        return response?.data.data ?? [];
    },

    getById: async (id: string): Promise<AdminData> => {
        const response = await apiClient.get(`/admin/admins/${id}`);
        return response?.data.data;
    },

    create: async (payload: AdminCreateRequest): Promise<AdminData> => {
        const response = await apiClient.post("/admin/admins", payload);
        return response?.data.data;
    },

    update: async (id: string, payload: AdminUpdateRequest): Promise<AdminData> => {
        const response = await apiClient.put(`/admin/admins/${id}`, payload);
        return response?.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/admins/${id}`);
    },
};