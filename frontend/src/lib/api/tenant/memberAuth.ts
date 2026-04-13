// lib/api/tenant/memberAuth.ts
import memberApiClient from "@/lib/member-api-client";
import { MemberData } from "@/types/tenant/members";
import { MemberLoginRequest, MemberLoginResponse } from "@/types/tenant/member-auth";

export const memberAuthAPI = {
    login: async (payload: MemberLoginRequest): Promise<MemberLoginResponse> => {
        // Login boleh pakai memberApiClient karena interceptor sudah handle
        // URL /login — tidak akan redirect jika 401
        const response = await memberApiClient.post("/member/auth/login", payload);
        return response?.data.data;
    },

    logout: async (): Promise<void> => {
        await memberApiClient.post("/member/auth/logout");
    },

    me: async (): Promise<MemberData> => {
        const response = await memberApiClient.get("/member/auth/me");
        return response?.data.data;
    },

    changePassword: async (data: {
        current_password: string;
        new_password: string;
        new_password_confirmation: string;
    }) => {
        const response = await memberApiClient.post("/member/auth/change-password", data);
        return response.data;
    },

    getGoogleRedirectUrl: async (): Promise<string> => {
        const response = await memberApiClient.get("/member/auth/google");
        return response?.data.data.url;
    },
};