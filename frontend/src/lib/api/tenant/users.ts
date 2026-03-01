import apiClient from "@/lib/api-client";
import { UserCreateRequest, UserData, UserUpdateRequest } from "@/types/tenant/users";

export const usersAPI = {
    getAll: async (params?: { page?: number; per_page?: number; search?: string; role?: string }): Promise<UserData[]> => {
        const response = await apiClient.get("/users", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
                role: params?.role || "", // Tambahan filter role jika diperlukan
            },
        });

        // Backend response wrapper biasanya { message: string, data: UserData[] }
        // Adjust sesuai struktur response backend Laravel Anda
        return response?.data?.data ?? [];
    },

    getById: async (id: string): Promise<UserData> => {
        const response = await apiClient.get(`/users/${id}`);
        return response?.data?.data;
    },

    create: async (payload: UserCreateRequest): Promise<UserData> => {
        const response = await apiClient.post("/users", payload);
        return response?.data?.data;
    },

    update: async (id: string, payload: UserUpdateRequest): Promise<UserData> => {
        const response = await apiClient.put(`/users/${id}`, payload);
        return response?.data?.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },
};
