import tenantApiClient from "@/lib/tenant-api-client";

export interface TenantDashboardSummary {
    total_members: number;
    new_members_this_month: number;
    new_members_last_month: number;
    active_memberships: number;
    frozen_count: number;
    expiring_soon_count: number;
    check_ins_today: number;
    check_ins_yesterday: number;
    revenue_this_month: number;
    revenue_last_month: number;
    pending_transactions: number;
    upcoming_classes_today: number;
    pt_sessions_today: number;
    total_branches: number;
}

export interface RevenueChartData {
    month: string;
    revenue: number;
}

export interface BranchPerformance {
    id: string;
    name: string;
    members_count: number;
    check_ins_today: number;
    revenue_this_month: number;
    active_memberships: number;
}

export interface ExpiringMembership {
    member_name: string;
    plan_name: string | null;
    branch_name: string;
    ends_at: string;
    days_left: number;
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
    branch_name: string;
}

export interface TenantDashboardData {
    summary: TenantDashboardSummary;
    revenue_chart: RevenueChartData[];
    branch_performance: BranchPerformance[];
    expiring_memberships: ExpiringMembership[];
    recent_check_ins: RecentCheckIn[];
    recent_transactions: RecentTransaction[];
}

export const dashboardAPI = {
    getSummary: async (): Promise<TenantDashboardData> => {
        const response = await tenantApiClient.get("/dashboard/summary");
        return response.data.data;
    },
};
