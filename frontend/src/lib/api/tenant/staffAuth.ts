import tenantApiClient from "@/lib/tenant-api-client";
import { ChangePasswordRequest, StaffLoginRequest, StaffLoginResponse } from "@/types/tenant/staff-auth";
import { StaffData } from "@/types/tenant/staffs";

export const staffAuthAPI = {
    login: async (payload: StaffLoginRequest): Promise<StaffLoginResponse> => {
        const response = await tenantApiClient.post("/tenant-auth/login", payload);
        return response?.data.data;
    },

    logout: async (): Promise<void> => {
        await tenantApiClient.post("/tenant-auth/logout");
    },

    me: async (): Promise<StaffData> => {
        const response = await tenantApiClient.get("/tenant-auth/me");
        return response?.data.data;
    },

    changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
        await tenantApiClient.post("/tenant-auth/change-password", payload);
    },

    /**
     * Ambil URL redirect Google dari BE
     * Lalu frontend redirect ke URL tersebut
     */
    getGoogleRedirectUrl: async (): Promise<string> => {
        const response = await tenantApiClient.get("/tenant-auth/google");
        return response?.data.data.url;
    },
};
