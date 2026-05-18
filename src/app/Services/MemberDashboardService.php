<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MemberDashboardService
{
    /**
     * Mengambil data dashboard khusus member yang login.
     */
    public function getDashboardData(string $memberId): array
    {
        return [
            'summary'          => $this->getSummary($memberId),
            'upcoming_classes' => $this->getUpcomingClasses($memberId),
            'recent_checkins'  => $this->getRecentCheckIns($memberId),
            'pt_packages'      => $this->getActivePtPackages($memberId),
        ];
    }

    private function getSummary(string $memberId): array
    {
        $now = now();

        // Active membership info
        $membership = DB::table('memberships')
            ->join('membership_plans', 'memberships.membership_plan_id', '=', 'membership_plans.id')
            ->where('memberships.member_id', $memberId)
            ->where('memberships.status', 'active')
            ->select(
                'memberships.id',
                'membership_plans.name as plan_name',
                'memberships.end_date',
                'memberships.unlimited_checkin',
                'memberships.remaining_checkin_quota',
            )
            ->first();

        // Check-ins this month
        $checkInsThisMonth = DB::table('check_ins')
            ->where('member_id', $memberId)
            ->where('status', 'success')
            ->whereYear('checked_in_at', $now->year)
            ->whereMonth('checked_in_at', $now->month)
            ->count();

        // Upcoming booked classes
        $upcomingClassesCount = DB::table('class_attendances')
            ->join('class_schedules', 'class_attendances.class_schedule_id', '=', 'class_schedules.id')
            ->where('class_attendances.member_id', $memberId)
            ->where('class_attendances.status', 'booked')
            ->where('class_schedules.date', '>=', $now->toDateString())
            ->where('class_schedules.status', 'scheduled')
            ->count();

        // Total classes attended (lifetime)
        $totalClassesAttended = DB::table('class_attendances')
            ->where('member_id', $memberId)
            ->where('status', 'attended')
            ->count();

        // PT sessions remaining (from active packages)
        $ptSessionsRemaining = DB::table('pt_packages')
            ->where('member_id', $memberId)
            ->where('status', 'active')
            ->selectRaw('COALESCE(SUM(total_sessions - used_sessions), 0) as remaining')
            ->value('remaining');

        return [
            'active_membership_name'  => $membership?->plan_name ?? null,
            'membership_end_date'     => $membership?->end_date ?? null,
            'remaining_checkin_quota'  => $membership?->remaining_checkin_quota ?? null,
            'unlimited_checkin'       => (bool) ($membership?->unlimited_checkin ?? false),
            'checkins_this_month'     => $checkInsThisMonth,
            'upcoming_classes_count'  => $upcomingClassesCount,
            'total_classes_attended'  => $totalClassesAttended,
            'pt_sessions_remaining'   => (int) $ptSessionsRemaining,
        ];
    }

    private function getUpcomingClasses(string $memberId): array
    {
        return DB::table('class_attendances')
            ->join('class_schedules', 'class_attendances.class_schedule_id', '=', 'class_schedules.id')
            ->leftJoin('class_plans', 'class_schedules.class_plan_id', '=', 'class_plans.id')
            ->leftJoin('staffs', 'class_schedules.instructor_id', '=', 'staffs.id')
            ->where('class_attendances.member_id', $memberId)
            ->where('class_attendances.status', 'booked')
            ->where('class_schedules.date', '>=', now()->toDateString())
            ->where('class_schedules.status', 'scheduled')
            ->select(
                'class_schedules.id',
                'class_plans.name as class_name',
                'class_plans.color as class_color',
                'class_plans.category as class_category',
                'class_schedules.date',
                'class_schedules.start_at',
                'class_schedules.end_at',
                'staffs.name as instructor_name',
            )
            ->orderBy('class_schedules.date')
            ->orderBy('class_schedules.start_at')
            ->take(5)
            ->get()
            ->toArray();
    }

    private function getRecentCheckIns(string $memberId): array
    {
        return DB::table('check_ins')
            ->leftJoin('branches', 'check_ins.branch_id', '=', 'branches.id')
            ->where('check_ins.member_id', $memberId)
            ->where('check_ins.status', 'success')
            ->select(
                'check_ins.id',
                'branches.name as branch_name',
                'check_ins.checked_in_at',
            )
            ->orderByDesc('check_ins.checked_in_at')
            ->take(5)
            ->get()
            ->toArray();
    }

    private function getActivePtPackages(string $memberId): array
    {
        return DB::table('pt_packages')
            ->leftJoin('pt_session_plans', 'pt_packages.pt_session_plan_id', '=', 'pt_session_plans.id')
            ->where('pt_packages.member_id', $memberId)
            ->whereIn('pt_packages.status', ['active', 'pending'])
            ->select(
                'pt_packages.id',
                'pt_session_plans.name as plan_name',
                'pt_packages.total_sessions',
                'pt_packages.used_sessions',
                'pt_packages.status',
                'pt_packages.expired_at',
            )
            ->orderByRaw("CASE pt_packages.status WHEN 'active' THEN 1 WHEN 'pending' THEN 2 ELSE 3 END")
            ->get()
            ->map(function ($pkg) {
                $pkg->remaining_sessions = max(0, $pkg->total_sessions - $pkg->used_sessions);
                return $pkg;
            })
            ->toArray();
    }
}
