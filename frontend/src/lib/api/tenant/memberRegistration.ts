import tenantApiClient from "@/lib/tenant-api-client";

export interface RegisterMemberRequest {
    plan_id: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
}

export interface RegisterMemberResponse {
    member: any;
    order_id: string;
    snap_token: string;
}

export const memberRegistrationAPI = {
    register: async (payload: RegisterMemberRequest, branchId?: string): Promise<RegisterMemberResponse> => {
        const response = await tenantApiClient.post("/member/register", payload, {
            headers: branchId ? { "X-Branch-Id": branchId } : {},
        });
        return response?.data.data;
    },
};