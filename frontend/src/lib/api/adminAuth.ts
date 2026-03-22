import apiClient from "@/lib/api-client";
import {
    AdminData,
    AdminLoginRequest,
    AdminLoginResponse,
    ChangePasswordRequest,
} from "@/types/central/admin-auth";

export const adminAuthAPI = {
    login: async (payload: AdminLoginRequest): Promise<AdminLoginResponse> => {
        const response = await apiClient.post("/admin/auth/login", payload);
        return response?.data.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post("/admin/auth/logout");
    },

    me: async (): Promise<AdminData> => {
        const response = await apiClient.get("/admin/auth/me");
        return response?.data.data;
    },

    changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
        await apiClient.post("/admin/auth/change-password", payload);
    },
};