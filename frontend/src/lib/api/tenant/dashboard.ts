import tenantApiClient from "@/lib/tenant-api-client";

export interface TenantDashboardSummary {
    total_members: number;
    new_members_this_month: number;
    active_memberships: number;
    check_ins_today: number;
    revenue_this_month: number;
    upcoming_classes_today: number;
}

export interface RevenueChartData {
    month: string;
    revenue: number;
}

export interface RecentCheckIn {
    id: string;
    member_name: string;
    member_avatar: string | null;
    branch_name: string;
    checked_in_at: string;
    status: string;
}

export interface RecentTransaction {
    id: string;
    invoice_number: string;
    total_amount: number;
    payment_method: string | null;
    status: string;
    paid_at: string | null;
    member_name: string;
}

export interface TenantDashboardData {
    summary: TenantDashboardSummary;
    revenue_chart: RevenueChartData[];
    recent_check_ins: RecentCheckIn[];
    recent_transactions: RecentTransaction[];
}

export const dashboardAPI = {
    getSummary: async (): Promise<TenantDashboardData> => {
        const response = await tenantApiClient.get("/dashboard/summary");
        return response.data.data;
    },
};
