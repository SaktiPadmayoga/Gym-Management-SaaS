import { useQuery } from "@tanstack/react-query";
import tenantApiClient from "@/lib/tenant-api-client";

export const useOwnerReports = (type: string, startDate?: string, endDate?: string, branchId?: string) => {
    return useQuery({
        queryKey: ["owner-reports", type, startDate, endDate, branchId],
        queryFn: async () => {
            const params = new URLSearchParams({ type });
            if (startDate) params.set("start_date", startDate);
            if (endDate) params.set("end_date", endDate);
            if (branchId && branchId !== "all") params.set("branch_id", branchId);

            const response = await tenantApiClient.get(`/reports?${params.toString()}`);
            return response.data.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });
};
