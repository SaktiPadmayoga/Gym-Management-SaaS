import tenantApiClient from "@/lib/tenant-api-client";
import { AssignMembershipRequest, MemberCreateRequest, MemberData, MembershipData, MemberUpdateRequest, UpdateMembershipRequest } from "@/types/tenant/members";

export const membersAPI = {
    getAll: async (params?: { page?: number; per_page?: number; search?: string; status?: string; is_active?: boolean; home_branch_id?: string }): Promise<MemberData[]> => {
        const response = await tenantApiClient.get("/members", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
                ...(params?.status && { status: params.status }),
                ...(params?.is_active !== undefined && { is_active: params.is_active }),
                ...(params?.home_branch_id && { home_branch_id: params.home_branch_id }),
            },
        });
        return response?.data.data.data ?? [];
    },

    getById: async (id: string): Promise<MemberData> => {
        const response = await tenantApiClient.get(`/members/${id}`);
        return response?.data.data;
    },

    create: async (payload: MemberCreateRequest | FormData): Promise<MemberData> => {
        const response = await tenantApiClient.post("/members", payload, {
            headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
        });
        return response?.data.data;
    },

    update: async (id: string, payload: MemberUpdateRequest | FormData): Promise<MemberData> => {
        // Jika pakai FormData, Laravel membutuhkan _method=PUT di dalam body POST request
        if (payload instanceof FormData) {
            payload.append("_method", "PUT");
            const response = await tenantApiClient.post(`/members/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response?.data.data;
        }

        const response = await tenantApiClient.put(`/members/${id}`, payload);
        return response?.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await tenantApiClient.delete(`/members/${id}`);
    },

    // ==========================================
    // MEMBERSHIP MANAGEMENT
    // ==========================================

    getMemberships: async (id: string): Promise<MembershipData[]> => {
        const response = await tenantApiClient.get(`/members/${id}/memberships`);
        return response?.data.data ?? [];
    },

    assignMembership: async (id: string, payload: AssignMembershipRequest): Promise<MembershipData> => {
        const response = await tenantApiClient.post(`/members/${id}/memberships`, payload);
        return response?.data.data;
    },

    updateMembership: async (memberId: string, membershipId: string, payload: UpdateMembershipRequest): Promise<MembershipData> => {
        const response = await tenantApiClient.patch(`/members/${memberId}/memberships/${membershipId}`, payload);
        return response?.data.data;
    },

    cancelMembership: async (memberId: string, membershipId: string): Promise<void> => {
        await tenantApiClient.delete(`/members/${memberId}/memberships/${membershipId}`);
    },
};
