import tenantApiClient from "@/lib/tenant-api-client";
import apiClient from "@/lib/api-client";
import {
    CreateDomainRequest,
    DomainRequestData,
    DomainRequestPaginatedResponse,
} from "@/types/central/domain-requests";

export type DomainRequestQueryParams = {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
    tenant_id?: string;
};

export const domainRequestsAPI = {
    // Tenant facing
    getMyRequests: async (params?: DomainRequestQueryParams): Promise<DomainRequestPaginatedResponse> => {
        const res = await tenantApiClient.get("/domain-requests/my", { params });
        return res.data;
    },

    create: async (payload: CreateDomainRequest): Promise<DomainRequestData> => {
        const res = await tenantApiClient.post("/domain-requests", payload);
        return res.data.data;
    },

    cancel: async (id: string): Promise<void> => {
        await tenantApiClient.delete(`/domain-requests/${id}`);
    },

    // Admin facing (central)
    getAll: async (params?: DomainRequestQueryParams): Promise<DomainRequestPaginatedResponse> => {
        const res = await apiClient.get("/domain-requests", { params });
        return res.data;
    },

    review: async (id: string, payload: { action: "approve" | "reject"; rejection_reason?: string }): Promise<DomainRequestData> => {
        const res = await apiClient.post(`/domain-requests/${id}/review`, payload);
        return res.data.data;
    },
};