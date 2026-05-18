import memberApiClient from "@/lib/member-api-client";
import { MemberDashboardData } from "@/types/tenant/member-dashboard";

export const memberDashboardAPI = {
    getSummary: async (): Promise<MemberDashboardData> => {
        const response = await memberApiClient.get("/member/dashboard");
        return response.data.data;
    },
};
