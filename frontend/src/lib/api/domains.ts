import apiClient from "@/lib/api-client";
import {
    DomainData,
    DomainCreateRequest,
    DomainUpdateRequest,
    DomainPaginatedResponse,
    DomainsQueryParams,
} from "@/types/central/domains";

export const domainsAPI = {
    getAll: async (params?: DomainsQueryParams): Promise<DomainPaginatedResponse> => {
        const res = await apiClient.get("/domains", { params });
        return res.data;
    },

    getById: async (id: string): Promise<DomainData> => {
        const res = await apiClient.get(`/domains/${id}`);
        return res.data.data;
    },

    create: async (payload: DomainCreateRequest): Promise<DomainData> => {
        const res = await apiClient.post("/domains", payload);
        return res.data.data;
    },

    update: async (id: string, payload: DomainUpdateRequest): Promise<DomainData> => {
        const res = await apiClient.put(`/domains/${id}`, payload);
        return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/domains/${id}`);
    },

    togglePrimary: async (id: string): Promise<DomainData> => {
        const res = await apiClient.patch(`/domains/${id}/toggle-primary`);
        return res.data.data;
    },
};
