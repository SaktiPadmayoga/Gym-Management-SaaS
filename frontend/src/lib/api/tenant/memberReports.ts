import memberApiClient from "@/lib/member-api-client";
import { MemberReportData } from "@/types/tenant/member-reports";

export const memberReportsAPI = {
    getSummary: async (startDate?: string, endDate?: string): Promise<MemberReportData> => {
        const params = new URLSearchParams();
        if (startDate) params.set("start_date", startDate);
        if (endDate) params.set("end_date", endDate);

        const response = await memberApiClient.get(`/member/reports/summary?${params.toString()}`);
        return response.data.data;
    },
};
