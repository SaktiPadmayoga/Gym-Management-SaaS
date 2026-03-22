import tenantApiClient from "@/lib/tenant-api-client";
import {
    ChangePasswordRequest,
    StaffLoginRequest,
    StaffLoginResponse,
} from "@/types/tenant/staff-auth";

export const staffAuthAPI = {
    login: async (payload: StaffLoginRequest): Promise<StaffLoginResponse> => {
        const response = await tenantApiClient.post("/auth/login", payload);
        return response?.data.data;
    },

    logout: async (): Promise<void> => {
        await tenantApiClient.post("/auth/logout");
    },

    me: async (): Promise<any> => {
        const response = await tenantApiClient.get("/auth/me");
        return response?.data.data;
    },

    changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
        await tenantApiClient.post("/auth/change-password", payload);
    },

    /**
     * Ambil URL redirect Google dari BE
     * Lalu frontend redirect ke URL tersebut
     */
    getGoogleRedirectUrl: async (): Promise<string> => {
        const response = await tenantApiClient.get("/auth/google");
        return response?.data.data.url;
    },
};