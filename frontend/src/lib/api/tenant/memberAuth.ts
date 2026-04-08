import tenantApiClient from "@/lib/tenant-api-client";
import { MemberData } from "@/types/tenant/members";
import { ChangePasswordRequest, MemberLoginRequest, MemberLoginResponse } from "@/types/tenant/member-auth";

// Catatan: Asumsi typing sudah kamu buat, jika belum, hapus import di atas dan pakai any sementara
export const memberAuthAPI = {
    login: async (payload: MemberLoginRequest): Promise<MemberLoginResponse> => {
        const response = await tenantApiClient.post("/member/auth/login", payload);
        return response?.data.data;
    },

    logout: async (): Promise<void> => {
        await tenantApiClient.post("/member/auth/logout");
    },

    me: async (): Promise<MemberData> => {
        const response = await tenantApiClient.get("/member/auth/me");
        return response?.data.data;
    },

    changePassword: async (data: { current_password: string; new_password: string; new_password_confirmation: string }) => {
        const response = await tenantApiClient.post("/member/auth/change-password", data);
        return response.data;
    },

    /**
     * Ambil URL redirect Google OAuth untuk Member.
     * Route backend ini diatur di routes/tenant.php agar tenant_id terbaca.
     */
    getGoogleRedirectUrl: async (): Promise<string> => {
        const response = await tenantApiClient.get("/member/auth/google");
        return response?.data.data.url;
    },
};
