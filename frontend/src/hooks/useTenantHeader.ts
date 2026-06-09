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
        retry: 0, // Jangan retry jika 404/500 (tenant tidak valid)
    });

    // Jika tenant gagal diload (invalid slug/domain tidak terdaftar)
    if (!query.isLoading && query.isError) {
        // Panggil notFound() dari Next.js untuk menampilkan halaman 404 tanpa redirect URL
        const { notFound } = require("next/navigation");
        notFound();
    }

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