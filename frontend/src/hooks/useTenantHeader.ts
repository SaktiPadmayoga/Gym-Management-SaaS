"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantAPI } from "@/lib/api/tenantApi";
import { useCallback } from "react";

export const TENANT_HEADER_KEY = ["tenant-header"];

export function useTenantHeader() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: TENANT_HEADER_KEY,
        queryFn: () => tenantAPI.getCurrent(),
        staleTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: 1000,
    });

    // Fungsi switch branch — simpan ke localStorage lalu refetch
    const switchBranch = useCallback((branchId: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("current_branch_id", branchId);
        }
        queryClient.invalidateQueries({ queryKey: TENANT_HEADER_KEY });
    }, [queryClient]);

    return {
        ...query,
        switchBranch,
    };
}