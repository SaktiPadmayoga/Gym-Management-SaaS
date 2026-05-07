import { useQuery } from "@tanstack/react-query";
import tenantApiClient from "@/lib/tenant-api-client";
import { TenantDashboardData } from "@/lib/api/tenant/dashboard";

// --- API FETCH (tanpa X-Branch-Id → data seluruh gym) ---
const fetchOwnerDashboard = async (): Promise<TenantDashboardData> => {
    // Owner tidak punya selectedBranch, jadi X-Branch-Id tidak akan di-set
    // oleh interceptor → backend return data semua branch
    const response = await tenantApiClient.get("/dashboard/summary");
    return response.data.data;
};

// --- QUERY KEYS ---
export const ownerDashboardKeys = {
    all: ["owner-dashboard"] as const,
    summary: () => [...ownerDashboardKeys.all, "summary"] as const,
};

// --- HOOK ---
export const useOwnerDashboard = () => {
    return useQuery<TenantDashboardData>({
        queryKey: ownerDashboardKeys.summary(),
        queryFn: fetchOwnerDashboard,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // Cache 5 menit
    });
};
