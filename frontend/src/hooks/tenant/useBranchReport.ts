import { useQuery } from "@tanstack/react-query";
import tenantApiClient from "@/lib/tenant-api-client";

export const useBranchReport = (type: string, startDate?: string, endDate?: string, date?: string) => {
    return useQuery({
        queryKey: ["branch-report", type, startDate, endDate, date],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (startDate) params.set("start_date", startDate);
            if (endDate) params.set("end_date", endDate);
            if (date) params.set("date", date);

            const response = await tenantApiClient.get(`/branch-reports/${type}?${params.toString()}`);
            return response.data.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });
};
