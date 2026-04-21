import tenantApiClient from "@/lib/tenant-api-client";
import {
    PtSessionData,
    PtSessionCreateRequest,
    PtSessionUpdateRequest,
    PtSessionQueryParams,
} from "@/types/tenant/pt";

export const ptSessionsAPI = {
    // Ambil semua jadwal PT (Staff/Admin)
    getAll: async (params?: PtSessionQueryParams): Promise<{ data: PtSessionData[]; meta: any }> => {
        const response = await tenantApiClient.get("/pt-sessions", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                ...(params?.search && { search: params.search }),
                ...(params?.date && { date: params.date }),
                ...(params?.status && { status: params.status }),
                ...(params?.trainer_id && { trainer_id: params.trainer_id }),
                ...(params?.member_id && { member_id: params.member_id }),
            },
        });
        
        return {
            data: response.data.data.data ?? [],
            meta: response.data.data.meta ?? null,
        };
    },

    // Detail jadwal PT
    getById: async (id: string): Promise<PtSessionData> => {
        const response = await tenantApiClient.get(`/pt-sessions/${id}`);
        return response.data.data;
    },

    // Buat jadwal PT baru
    create: async (payload: PtSessionCreateRequest): Promise<PtSessionData> => {
        const response = await tenantApiClient.post("/pt-sessions", payload);
        return response.data.data;
    },

    // Update jadwal PT
    update: async (id: string, payload: PtSessionUpdateRequest): Promise<PtSessionData> => {
        const response = await tenantApiClient.put(`/pt-sessions/${id}`, payload);
        return response.data.data;
    },

    // Hapus/Batalkan jadwal PT (Soft delete / Cancel)
    cancel: async (id: string, reason?: string): Promise<PtSessionData> => {
        const response = await tenantApiClient.patch(`/pt-sessions/${id}/cancel`, {
            cancelled_reason: reason,
        });
        return response.data.data;
    },
};