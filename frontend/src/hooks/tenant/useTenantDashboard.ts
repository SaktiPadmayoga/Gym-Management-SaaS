import { useQuery } from "@tanstack/react-query";
import { dashboardAPI, TenantDashboardData } from "@/lib/api/tenant/dashboard";

// --- QUERY KEYS ---
export const tenantDashboardKeys = {
    all: ["tenant-dashboard"] as const,
    summary: () => [...tenantDashboardKeys.all, "summary"] as const,
};

// --- HOOK ---
export const useTenantDashboard = () => {
    return useQuery<TenantDashboardData>({
        queryKey: tenantDashboardKeys.summary(),
        queryFn: () => dashboardAPI.getSummary(),
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // Cache 5 menit
    });
};
