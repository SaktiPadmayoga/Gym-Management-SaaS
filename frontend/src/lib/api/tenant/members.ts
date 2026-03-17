import tenantApiClient from "@/lib/tenant-api-client";
import {
    AssignMemberBranchRequest,
    MemberCreateRequest,
    MemberData,
    MemberUpdateRequest,
    UpdateMembershipRequest,
} from "@/types/tenant/members";

export const membersAPI = {
    getAll: async (params?: {
        page?:              number;
        per_page?:          number;
        search?:            string;
        status?:            string;
        gender?:            string;
        is_active?:         boolean;
        expiring_in_days?:  number;
    }): Promise<any> => {
        const response = await tenantApiClient.get("/members", {
            params: {
                page:     params?.page     || 1,
                per_page: params?.per_page || 15,
                search:   params?.search   || "",
                ...(params?.status            && { status: params.status }),
                ...(params?.gender            && { gender: params.gender }),
                ...(params?.is_active !== undefined && { is_active: params.is_active }),
                ...(params?.expiring_in_days  && { expiring_in_days: params.expiring_in_days }),
            },
        });
        return response?.data.data ?? [];
    },

    getById: async (id: string): Promise<MemberData> => {
        const response = await tenantApiClient.get(`/members/${id}`);
        return response?.data.data;
    },

    create: async (payload: MemberCreateRequest): Promise<MemberData> => {
        const response = await tenantApiClient.post("/members", payload);
        return response?.data.data;
    },

    update: async (id: string, payload: MemberUpdateRequest): Promise<MemberData> => {
        const response = await tenantApiClient.put(`/members/${id}`, payload);
        return response?.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await tenantApiClient.delete(`/members/${id}`);
    },

    // Branch membership
    getBranches: async (id: string): Promise<any> => {
        const response = await tenantApiClient.get(`/members/${id}/branches`);
        return response?.data.data ?? [];
    },

    assignBranch: async (id: string, payload: AssignMemberBranchRequest): Promise<any> => {
        const response = await tenantApiClient.post(`/members/${id}/branches`, payload);
        return response?.data.data;
    },

    updateMembership: async (
        memberId: string,
        branchId: string,
        payload: UpdateMembershipRequest
    ): Promise<any> => {
        const response = await tenantApiClient.patch(
            `/members/${memberId}/branches/${branchId}/membership`,
            payload
        );
        return response?.data.data;
    },

    revokeBranch: async (memberId: string, branchId: string): Promise<void> => {
        await tenantApiClient.delete(`/members/${memberId}/branches/${branchId}`);
    },
};