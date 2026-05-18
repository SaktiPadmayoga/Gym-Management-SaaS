// Types for Member Reports API response

export interface CheckinTrendItem {
    month: string;
    count: number;
}

export interface ClassSummary {
    total: number;
    attended: number;
    booked: number;
    cancelled: number;
    no_show: number;
}

export interface SpendingBreakdownItem {
    item_type: string;
    amount: number;
}

export interface SpendingSummary {
    total_transactions: number;
    total_spent: number;
    breakdown: Record<string, SpendingBreakdownItem>;
}

export interface CheckinStats {
    total_checkins: number;
}

export interface MemberReportData {
    checkin_trend: CheckinTrendItem[];
    class_summary: ClassSummary;
    spending_summary: SpendingSummary;
    checkin_stats: CheckinStats;
}
