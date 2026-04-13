import tenantApiClient from "@/lib/tenant-api-client";
import { CheckInCreateRequest, CheckInData } from "@/types/tenant/checkIns";

export const checkInsAPI = {
    /**
     * POST /check-ins
     * Memproses QR Code dari Scanner
     */
    create: async (payload: CheckInCreateRequest): Promise<{ data: CheckInData; message: string }> => {
        const response = await tenantApiClient.post("/check-ins", payload);
        // Mengembalikan data dan message agar UI bisa menampilkan "Selamat latihan, Budi!"
        return {
            data: response?.data.data,
            message: response?.data.message,
        };
    },

    /**
     * GET /check-ins
     * Untuk melihat riwayat absensi di Dashboard Admin/Resepsionis
     */
    getAll: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
        status?: string;
        date?: string;
    }): Promise<{ data: CheckInData[]; meta: any }> => {
        const response = await tenantApiClient.get("/check-ins", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
                ...(params?.status && { status: params.status }),
                ...(params?.date && { date: params.date }),
            },
        });
        return {
            data: response.data.data.data ?? [],
            meta: response.data.data.meta ?? null,
        };
    },
};