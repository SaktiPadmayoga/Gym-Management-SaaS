// File: src/hooks/tenant/useTransactionHistory.ts
import { useQuery } from "@tanstack/react-query";
import tenantApiClient from "@/lib/tenant-api-client";

export type TransactionQueryParams = {
    page?: number;
    search?: string;
    type?: string;
    status?: string;
};

export function useTransactionHistory(params?: TransactionQueryParams) {
    return useQuery({
        queryKey: ["transaction-history", params],
        queryFn: async () => {
            // Sesuai dengan rute yang kita buat sebelumnya di routes/tenant.php
            const response = await tenantApiClient.get("/pos/history", { params });
            // API Laravel biasanya mengembalikan data paginasi di dalam response.data.data
            return response.data.data; 
        },
        staleTime: 60_000, // Cache data selama 1 menit agar tidak spam API
        placeholderData: (prev) => prev, // Biarkan data lama tampil saat fetch page baru (UX lebih smooth)
    });
}