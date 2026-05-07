import tenantApiClient from "@/lib/tenant-api-client";

export interface ReportBranch {
    id: string;
    name: string;
}

export const reportsAPI = {
    getReport: async (type: string, startDate?: string, endDate?: string, branchId?: string) => {
        const params = new URLSearchParams({ type });
        if (startDate) params.set("start_date", startDate);
        if (endDate) params.set("end_date", endDate);
        if (branchId && branchId !== "all") params.set("branch_id", branchId);

        const response = await tenantApiClient.get(`/reports?${params.toString()}`);
        return response.data.data;
    },

    exportReport: async (type: string, startDate?: string, endDate?: string, branchId?: string) => {
        const params = new URLSearchParams({ type });
        if (startDate) params.set("start_date", startDate);
        if (endDate) params.set("end_date", endDate);
        if (branchId && branchId !== "all") params.set("branch_id", branchId);

        const response = await tenantApiClient.get(`/reports/export?${params.toString()}`, {
            responseType: "blob",
        });
        return response.data;
    },

    getBranches: async (): Promise<ReportBranch[]> => {
        const response = await tenantApiClient.get("/reports/branches");
        return response.data.data;
    },
};
