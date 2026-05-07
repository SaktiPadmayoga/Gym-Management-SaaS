import { useQuery } from "@tanstack/react-query";
import { reportsAPI, ReportBranch } from "@/lib/api/tenant/reports";

export const useOwnerBranches = () => {
    return useQuery<ReportBranch[]>({
        queryKey: ["owner-report-branches"],
        queryFn: () => reportsAPI.getBranches(),
        refetchOnWindowFocus: false,
        staleTime: 10 * 60 * 1000, // 10 menit — daftar cabang jarang berubah
    });
};
