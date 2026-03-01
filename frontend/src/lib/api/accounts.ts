import apiClient from "@/lib/api-client";
import { AccountCreateRequest, AccountData, AccountUpdateRequest } from "@/types/central/accounts";

export const accountsAPI = {
    getAll: async (params?: { page?: number; per_page?: number; search?: string }): Promise<AccountData[]> => {
        const response = await apiClient.get("/accounts", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
            },
        });

        return response?.data ?? [];
    },

    getById: async (id: string): Promise<AccountData> => {
        const response = await apiClient.get(`/accounts/${id}`);
        return response?.data;
    },

    create: async (payload: AccountCreateRequest): Promise<AccountData> => {
        const response = await apiClient.post("/accounts", payload);
        return response?.data;
    },

    update: async (id: string, payload: AccountUpdateRequest): Promise<AccountData> => {
        const response = await apiClient.put(`/accounts/${id}`, payload);
        return response?.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/accounts/${id}`);
    },
};
