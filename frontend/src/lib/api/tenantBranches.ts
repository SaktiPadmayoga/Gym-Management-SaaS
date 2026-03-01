import { TenantBranchesQueryParams } from "@/hooks/useTenantBranches";
import tenantApiClient from "@/lib/tenant-api-client";
import {
    TenantBranchCreateRequest,
    TenantBranchData,
    TenantBranchPaginatedResponse,
    TenantBranchUpdateRequest,
} from "@/types/central/tenant-branches";

export const tenantBranchesAPI = {
    getAll: async (params?: TenantBranchesQueryParams): Promise<TenantBranchPaginatedResponse> => {
        const res = await tenantApiClient.get("/branches", { params });
        return res.data;
    },

    getById: async (id: string): Promise<TenantBranchData> => {
        const res = await tenantApiClient.get(`/branches/${id}`);
        return res.data.data;
    },

    create: async (payload: TenantBranchCreateRequest): Promise<TenantBranchData> => {
        const res = await tenantApiClient.post("/branches", payload);
        return res.data.data;
    },

    update: async (id: string, payload: TenantBranchUpdateRequest): Promise<TenantBranchData> => {
        const res = await tenantApiClient.put(`/branches/${id}`, payload);
        return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await tenantApiClient.delete(`/branches/${id}`);
    },

    restore: async (id: string): Promise<TenantBranchData> => {
        const res = await tenantApiClient.post(`/branches/${id}/restore`);
        return res.data.data;
    },

    toggleActive: async (id: string): Promise<TenantBranchData> => {
        const res = await tenantApiClient.patch(`/branches/${id}/toggle-active`);
        return res.data.data;
    },
};
