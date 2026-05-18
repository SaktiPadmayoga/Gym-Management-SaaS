import { useQuery } from "@tanstack/react-query";
import { memberReportsAPI } from "@/lib/api/tenant/memberReports";
import { MemberReportData } from "@/types/tenant/member-reports";

// --- QUERY KEYS ---
export const memberReportKeys = {
    all: ["member-reports"] as const,
    summary: (startDate?: string, endDate?: string) =>
        [...memberReportKeys.all, "summary", startDate, endDate] as const,
};

// --- HOOK ---
export const useMemberReportSummary = (startDate?: string, endDate?: string) => {
    return useQuery<MemberReportData>({
        queryKey: memberReportKeys.summary(startDate, endDate),
        queryFn: () => memberReportsAPI.getSummary(startDate, endDate),
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });
};
