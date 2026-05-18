import { useQuery } from "@tanstack/react-query";
import { memberDashboardAPI } from "@/lib/api/tenant/memberDashboard";
import { MemberDashboardData } from "@/types/tenant/member-dashboard";

// --- QUERY KEYS ---
export const memberDashboardKeys = {
    all: ["member-dashboard"] as const,
    summary: () => [...memberDashboardKeys.all, "summary"] as const,
};

// --- HOOK ---
export const useMemberDashboard = () => {
    return useQuery<MemberDashboardData>({
        queryKey: memberDashboardKeys.summary(),
        queryFn: () => memberDashboardAPI.getSummary(),
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // Cache 5 menit
    });
};
