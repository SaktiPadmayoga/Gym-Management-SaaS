// hooks/useTenantHeader.ts

"use client";

import { useQuery } from "@tanstack/react-query";
import { tenantAPI } from "@/lib/api/tenantApi";

export function useTenantHeader() {
    return useQuery({
        queryKey: ["tenant-header"],
        queryFn: async () => {
            const data = await tenantAPI.getCurrent();

            // Pastikan data tidak undefined
            if (!data) {
                throw new Error("Tenant data is undefined");
            }

            return data;
        },
        staleTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: 1000,
        // Optional: gunakan placeholder data saat loading
        placeholderData: undefined,
        // Jangan throw error ke UI, handle di component
    });
}
