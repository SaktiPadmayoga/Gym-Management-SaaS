import tenantApiClient from "@/lib/tenant-api-client";

export const facilityBookingsAPI = {
    getAll: async (params?: any) => {
        const response = await tenantApiClient.get("facility-bookings", { params });
        return {
            data: response.data.data.data ?? response.data.data ?? [],
            meta: response.data.data.meta ?? null,
        };
    },

    getById: async (id: string) => {
        const response = await tenantApiClient.get(`facility-bookings/${id}`);
        return response.data.data;
    },

    create: async (payload: any) => {
        const response = await tenantApiClient.post("facility-bookings", payload);
        return response.data.data;
    },

    update: async (id: string, payload: any) => {
        const response = await tenantApiClient.put(`facility-bookings/${id}`, payload);
        return response.data.data;
    },

    delete: async (id: string, reason?: string) => {
        const response = await tenantApiClient.delete(`facility-bookings/${id}`, {
            params: { reason }
        });
        return response.data.data;
    },
};