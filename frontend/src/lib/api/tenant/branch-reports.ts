import tenantApiClient from "@/lib/tenant-api-client";

export const branchReportsAPI = {
    getReport: async (type: string, startDate?: string, endDate?: string, date?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.set("start_date", startDate);
        if (endDate) params.set("end_date", endDate);
        if (date) params.set("date", date);

        const response = await tenantApiClient.get(`/branch-reports/${type}?${params.toString()}`);
        return response.data.data;
    },
};
