import tenantApiClient from "@/lib/tenant-api-client";
import {
    AssignBranchRequest,
    StaffCreateRequest,
    StaffData,
    StaffUpdateRequest,
} from "@/types/tenant/staffs";

export const staffAPI = {
    getAll: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
        branch_id?: string;
        role?: string;
        is_active?: boolean;
    }): Promise<any> => {
        const response = await tenantApiClient.get("/staff", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
                ...(params?.branch_id && { branch_id: params.branch_id }),
                ...(params?.role && { role: params.role }),
                ...(params?.is_active !== undefined && {
                    is_active: params.is_active,
                }),
            },
        });

        return response?.data.data ?? [];
    },

    getById: async (id: string): Promise<StaffData> => {
        const response = await tenantApiClient.get(`/staff/${id}`);
        return response?.data.data;
    },

    create: async (payload: StaffCreateRequest): Promise<StaffData> => {
        const response = await tenantApiClient.post("/staff", payload);
        return response?.data.data;
    },

    update: async (
        id: string,
        payload: StaffUpdateRequest
    ): Promise<StaffData> => {
        const response = await tenantApiClient.put(`/staff/${id}`, payload);
        return response?.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await tenantApiClient.delete(`/staff/${id}`);
    },

    // Branch assignment
    getBranches: async (id: string): Promise<any> => {
        const response = await tenantApiClient.get(`/staff/${id}/branches`);
        return response?.data.data ?? [];
    },

    assignBranch: async (
        id: string,
        payload: AssignBranchRequest
    ): Promise<any> => {
        const response = await tenantApiClient.post(`/staff/${id}/branches`, payload);
        return response?.data.data;
    },

    revokeBranch: async (
        staffId: string,
        branchId: string
    ): Promise<void> => {
        await tenantApiClient.delete(`/staff/${staffId}/branches/${branchId}`);
    },
};