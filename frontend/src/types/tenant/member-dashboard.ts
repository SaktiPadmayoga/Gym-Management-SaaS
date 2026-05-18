// Types for Member Dashboard API response

export interface MemberDashboardSummary {
    active_membership_name: string | null;
    membership_end_date: string | null;
    remaining_checkin_quota: number | null;
    unlimited_checkin: boolean;
    checkins_this_month: number;
    upcoming_classes_count: number;
    total_classes_attended: number;
    pt_sessions_remaining: number;
}

export interface UpcomingClass {
    id: string;
    class_name: string;
    class_color: string | null;
    class_category: string | null;
    date: string;
    start_at: string;
    end_at: string;
    instructor_name: string | null;
}

export interface RecentCheckIn {
    id: string;
    branch_name: string | null;
    checked_in_at: string;
}

export interface PtPackageSummary {
    id: string;
    plan_name: string;
    total_sessions: number;
    used_sessions: number;
    remaining_sessions: number;
    status: string;
    expired_at: string | null;
}

export interface MemberDashboardData {
    summary: MemberDashboardSummary;
    upcoming_classes: UpcomingClass[];
    recent_checkins: RecentCheckIn[];
    pt_packages: PtPackageSummary[];
}
