<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BranchReportService
{
    private function hourExpression(string $column): string
    {
        return "EXTRACT(HOUR FROM {$column})";
    }

    private function itemTypeLabel(?string $itemType): string
    {
        return match ($itemType) {
            \App\Models\Tenant\Product::class, 'product' => 'Product',
            \App\Models\Tenant\MembershipPlan::class, 'membership' => 'Membership',
            \App\Models\Tenant\ClassSchedule::class, 'class_schedule', 'class' => 'Class Schedule',
            \App\Models\Tenant\PtSessionPlan::class, 'pt_package', 'pt_session' => 'PT Package',
            \App\Models\Tenant\FacilityBooking::class, 'facility_booking', 'facility' => 'Facility Booking',
            default => $itemType ? class_basename($itemType) : 'Other',
        };
    }

    // ============================================================================
    // 1. DAILY REPORT — Snapshot hari ini
    // ============================================================================
    public function getDailyReport(string $branchId, Carbon $date): array
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay   = $date->copy()->endOfDay();

        // Revenue hari ini
        $todayRevenue = DB::table('tenant_invoices')
            ->where('branch_id', $branchId)
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$startOfDay, $endOfDay])
            ->sum('total_amount');

        $todayTransactions = DB::table('tenant_invoices')
            ->where('branch_id', $branchId)
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$startOfDay, $endOfDay])
            ->count();

        // Check-ins hari ini
        $todayCheckins = DB::table('check_ins')
            ->where('branch_id', $branchId)
            ->where('status', 'success')
            ->whereBetween('checked_in_at', [$startOfDay, $endOfDay])
            ->count();

        // Member baru hari ini
        $todayNewMembers = DB::table('members')
            ->where('home_branch_id', $branchId)
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->count();

        // Kelas hari ini
        $todayClasses = DB::table('class_schedules')
            ->where('branch_id', $branchId)
            ->where('date', $date->toDateString())
            ->count();

        $todayClassAttendees = DB::table('class_schedules')
            ->where('branch_id', $branchId)
            ->where('date', $date->toDateString())
            ->sum('total_attended');

        // PT Sessions hari ini
        $todayPtSessions = DB::table('pt_sessions')
            ->where('branch_id', $branchId)
            ->where('date', $date->toDateString())
            ->count();

        // Hourly check-in distribution
        $hourlyCheckins = DB::table('check_ins')
            ->where('branch_id', $branchId)
            ->where('status', 'success')
            ->whereBetween('checked_in_at', [$startOfDay, $endOfDay])
            ->selectRaw($this->hourExpression('checked_in_at') . ' as hour, COUNT(*) as total')
            ->groupBy(DB::raw($this->hourExpression('checked_in_at')))
            ->orderBy('hour')
            ->get()
            ->map(fn($item) => [
                'hour'  => sprintf('%02d:00', $item->hour),
                'total' => (int) $item->total,
            ]);

        // Recent transactions today
        $recentTransactions = DB::table('tenant_invoices')
            ->join('members', 'tenant_invoices.member_id', '=', 'members.id')
            ->where('tenant_invoices.branch_id', $branchId)
            ->where('tenant_invoices.status', 'paid')
            ->whereBetween('tenant_invoices.paid_at', [$startOfDay, $endOfDay])
            ->select(
                'tenant_invoices.invoice_number',
                'tenant_invoices.total_amount',
                'tenant_invoices.payment_method',
                'tenant_invoices.paid_at',
                'members.name as member_name'
            )
            ->latest('tenant_invoices.paid_at')
            ->take(10)
            ->get();

        return [
            'summary' => [
                'revenue'        => (float) $todayRevenue,
                'transactions'   => $todayTransactions,
                'check_ins'      => $todayCheckins,
                'new_members'    => $todayNewMembers,
                'classes'        => $todayClasses,
                'class_attendees'=> (int) $todayClassAttendees,
                'pt_sessions'    => $todayPtSessions,
            ],
            'charts' => [
                'hourly_checkins' => $hourlyCheckins,
            ],
            'tables' => [
                'recent_transactions' => $recentTransactions,
            ],
        ];
    }

    // ============================================================================
    // 2. MEMBER ANALYTICS
    // ============================================================================
    public function getMemberReport(string $branchId, Carbon $start, Carbon $end): array
    {
        $newMembers = DB::table('members')
            ->where('home_branch_id', $branchId)
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $churnedMembers = DB::table('members')
            ->where('home_branch_id', $branchId)
            ->whereIn('status', ['expired', 'banned'])
            ->whereBetween('updated_at', [$start, $end])
            ->count();

        // Status distribution
        $statusDistribution = DB::table('members')
            ->where('home_branch_id', $branchId)
            ->selectRaw("status as name, COUNT(*) as value")
            ->groupBy('status')
            ->get();

        // Daily registration trend
        $registrationTrend = DB::table('members')
            ->where('home_branch_id', $branchId)
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('CAST(created_at AS date) as date, COUNT(*) as total')
            ->groupBy(DB::raw('CAST(created_at AS date)'))
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date'  => Carbon::parse($item->date)->translatedFormat('d M'),
                'total' => (int) $item->total,
            ]);

        // New members list
        $newMembersList = DB::table('members')
            ->where('home_branch_id', $branchId)
            ->whereBetween('created_at', [$start, $end])
            ->select('name', 'email', 'phone', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($item) => [
                'name'       => $item->name,
                'email'      => $item->email,
                'phone'      => $item->phone,
                'status'     => $item->status,
                'created_at' => Carbon::parse($item->created_at)->translatedFormat('d M Y'),
            ]);

        return [
            'summary' => [
                'new_members'     => $newMembers,
                'churned_members' => $churnedMembers,
                'net_growth'      => $newMembers - $churnedMembers,
            ],
            'charts' => [
                'registration_trend'  => $registrationTrend,
                'status_distribution' => $statusDistribution,
            ],
            'tables' => [
                'new_members' => $newMembersList,
            ],
        ];
    }

    // ============================================================================
    // 3. MEMBERSHIP REPORT
    // ============================================================================
    public function getMembershipReport(string $branchId, Carbon $start, Carbon $end): array
    {
        $activeMemberships = DB::table('memberships')
            ->where('branch_id', $branchId)->where('status', 'active')->count();
        $frozenMemberships = DB::table('memberships')
            ->where('branch_id', $branchId)->where('status', 'frozen')->count();
        $expiredInPeriod = DB::table('memberships')
            ->where('branch_id', $branchId)->where('status', 'expired')
            ->whereBetween('end_date', [$start, $end])->count();

        // Plan distribution
        $planDistribution = DB::table('memberships')
            ->join('membership_plans', 'memberships.membership_plan_id', '=', 'membership_plans.id')
            ->where('memberships.branch_id', $branchId)
            ->where('memberships.status', 'active')
            ->selectRaw('membership_plans.name, COUNT(memberships.id) as value')
            ->groupBy('membership_plans.id', 'membership_plans.name')
            ->get()
            ->map(fn($item) => ['name' => $item->name, 'value' => (int) $item->value]);

        // Expiring soon (7 days)
        $expiringSoon = DB::table('memberships')
            ->join('members', 'memberships.member_id', '=', 'members.id')
            ->join('membership_plans', 'memberships.membership_plan_id', '=', 'membership_plans.id')
            ->where('memberships.branch_id', $branchId)
            ->where('memberships.status', 'active')
            ->whereBetween('memberships.end_date', [now(), now()->addDays(7)])
            ->select('members.name as member_name', 'membership_plans.name as plan_name', 'memberships.end_date')
            ->orderBy('memberships.end_date')
            ->get()
            ->map(fn($item) => [
                'member_name' => $item->member_name,
                'plan_name'   => $item->plan_name,
                'ends_at'     => Carbon::parse($item->end_date)->translatedFormat('d M Y'),
                'days_left'   => (int) Carbon::parse($item->end_date)->diffInDays(now()),
            ]);

        return [
            'summary' => [
                'active_count'  => $activeMemberships,
                'frozen_count'  => $frozenMemberships,
                'expired_count' => $expiredInPeriod,
            ],
            'charts' => [
                'plan_distribution' => $planDistribution,
            ],
            'tables' => [
                'expiring_soon' => $expiringSoon,
            ],
        ];
    }

    // ============================================================================
    // 4. CHECK-IN TIME REPORT — Hourly heatmap, peak hours
    // ============================================================================
    public function getCheckinTimeReport(string $branchId, Carbon $start, Carbon $end): array
    {
        $totalCheckins = DB::table('check_ins')
            ->where('branch_id', $branchId)->where('status', 'success')
            ->whereBetween('checked_in_at', [$start, $end])->count();

        // Hourly distribution
        $hourlyDistribution = DB::table('check_ins')
            ->where('branch_id', $branchId)->where('status', 'success')
            ->whereBetween('checked_in_at', [$start, $end])
            ->selectRaw($this->hourExpression('checked_in_at') . ' as hour, COUNT(*) as total')
            ->groupBy(DB::raw($this->hourExpression('checked_in_at')))
            ->orderBy('hour')
            ->get()
            ->map(fn($item) => [
                'hour'  => sprintf('%02d:00', $item->hour),
                'total' => (int) $item->total,
            ]);

        // Daily check-in trend
        $dailyTrend = DB::table('check_ins')
            ->where('branch_id', $branchId)->where('status', 'success')
            ->whereBetween('checked_in_at', [$start, $end])
            ->selectRaw('CAST(checked_in_at AS date) as date, COUNT(*) as total')
            ->groupBy(DB::raw('CAST(checked_in_at AS date)'))
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date'  => Carbon::parse($item->date)->translatedFormat('d M'),
                'total' => (int) $item->total,
            ]);

        // Day of week distribution
        $dayOfWeekDistribution = DB::table('check_ins')
            ->where('branch_id', $branchId)->where('status', 'success')
            ->whereBetween('checked_in_at', [$start, $end])
            ->selectRaw("TRIM(TO_CHAR(checked_in_at, 'Day')) as name, EXTRACT(ISODOW FROM checked_in_at) as day_order, COUNT(*) as value")
            ->groupBy(DB::raw("TRIM(TO_CHAR(checked_in_at, 'Day'))"), DB::raw('EXTRACT(ISODOW FROM checked_in_at)'))
            ->orderBy('day_order')
            ->get()
            ->map(fn($item) => [
                'name'  => $item->name,
                'value' => (int) $item->value,
            ]);

        // Peak hour
        $peakHour = $hourlyDistribution->sortByDesc('total')->first();

        return [
            'summary' => [
                'total_checkins' => $totalCheckins,
                'peak_hour'      => $peakHour ? $peakHour['hour'] : '-',
                'peak_count'     => $peakHour ? $peakHour['total'] : 0,
            ],
            'charts' => [
                'hourly_distribution'     => $hourlyDistribution,
                'daily_trend'             => $dailyTrend,
                'day_of_week_distribution' => $dayOfWeekDistribution,
            ],
        ];
    }

    // ============================================================================
    // 5. CHECK-IN MEMBER REPORT — Top members, frequency
    // ============================================================================
    public function getCheckinMemberReport(string $branchId, Carbon $start, Carbon $end): array
    {
        $totalCheckins = DB::table('check_ins')
            ->where('branch_id', $branchId)->where('status', 'success')
            ->whereBetween('checked_in_at', [$start, $end])->count();

        $uniqueMembers = DB::table('check_ins')
            ->where('branch_id', $branchId)->where('status', 'success')
            ->whereBetween('checked_in_at', [$start, $end])
            ->distinct('member_id')->count('member_id');

        $avgPerMember = $uniqueMembers > 0 ? round($totalCheckins / $uniqueMembers, 1) : 0;

        // Top 10 members by check-in count
        $topMembers = DB::table('check_ins')
            ->join('members', 'check_ins.member_id', '=', 'members.id')
            ->where('check_ins.branch_id', $branchId)
            ->where('check_ins.status', 'success')
            ->whereBetween('check_ins.checked_in_at', [$start, $end])
            ->selectRaw('members.name, members.email, COUNT(check_ins.id) as total_checkins')
            ->groupBy('members.id', 'members.name', 'members.email')
            ->orderByDesc('total_checkins')
            ->take(10)
            ->get();

        // Frequency distribution (1x, 2-5x, 6-10x, 11+)
        $frequencyRaw = DB::table('check_ins')
            ->where('branch_id', $branchId)->where('status', 'success')
            ->whereBetween('checked_in_at', [$start, $end])
            ->selectRaw('member_id, COUNT(*) as cnt')
            ->groupBy('member_id')
            ->get();

        $frequencyBuckets = [
            ['name' => '1x', 'value' => 0],
            ['name' => '2-5x', 'value' => 0],
            ['name' => '6-10x', 'value' => 0],
            ['name' => '11x+', 'value' => 0],
        ];
        foreach ($frequencyRaw as $row) {
            $cnt = (int) $row->cnt;
            if ($cnt === 1)       $frequencyBuckets[0]['value']++;
            elseif ($cnt <= 5)    $frequencyBuckets[1]['value']++;
            elseif ($cnt <= 10)   $frequencyBuckets[2]['value']++;
            else                  $frequencyBuckets[3]['value']++;
        }

        return [
            'summary' => [
                'total_checkins'  => $totalCheckins,
                'unique_members'  => $uniqueMembers,
                'avg_per_member'  => $avgPerMember,
            ],
            'charts' => [
                'frequency_distribution' => $frequencyBuckets,
            ],
            'tables' => [
                'top_members' => $topMembers,
            ],
        ];
    }

    // ============================================================================
    // 6. CLASS REPORT — Attendance rate, popular classes
    // ============================================================================
    public function getClassReport(string $branchId, Carbon $start, Carbon $end): array
    {
        $totalClasses = DB::table('class_schedules')
            ->where('branch_id', $branchId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->count();

        $totalBooked = DB::table('class_schedules')
            ->where('branch_id', $branchId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->sum('total_booked');

        $totalAttended = DB::table('class_schedules')
            ->where('branch_id', $branchId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->sum('total_attended');

        $attendanceRate = $totalBooked > 0 ? round(($totalAttended / $totalBooked) * 100, 1) : 0;

        // Popular classes (by total attended)
        $popularClasses = DB::table('class_schedules')
            ->join('class_plans', 'class_schedules.class_plan_id', '=', 'class_plans.id')
            ->where('class_schedules.branch_id', $branchId)
            ->whereBetween('class_schedules.date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw('class_plans.name, COUNT(class_schedules.id) as total_sessions, SUM(class_schedules.total_attended) as total_attended')
            ->groupBy('class_plans.id', 'class_plans.name')
            ->orderByDesc('total_attended')
            ->take(10)
            ->get()
            ->map(fn($item) => [
                'name'           => $item->name,
                'total_sessions' => (int) $item->total_sessions,
                'total_attended' => (int) $item->total_attended,
            ]);

        // Instructor load
        $instructorLoad = DB::table('class_schedules')
            ->join('staffs', 'class_schedules.instructor_id', '=', 'staffs.id')
            ->where('class_schedules.branch_id', $branchId)
            ->whereBetween('class_schedules.date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw('staffs.name, COUNT(class_schedules.id) as total_sessions, SUM(class_schedules.total_attended) as total_attended')
            ->groupBy('staffs.id', 'staffs.name')
            ->orderByDesc('total_sessions')
            ->get()
            ->map(fn($item) => [
                'name'           => $item->name,
                'total_sessions' => (int) $item->total_sessions,
                'total_attended' => (int) $item->total_attended,
            ]);

        // Status distribution
        $statusDistribution = DB::table('class_schedules')
            ->where('branch_id', $branchId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw("status as name, COUNT(*) as value")
            ->groupBy('status')
            ->get();

        return [
            'summary' => [
                'total_classes'   => $totalClasses,
                'total_booked'    => (int) $totalBooked,
                'total_attended'  => (int) $totalAttended,
                'attendance_rate' => $attendanceRate,
            ],
            'charts' => [
                'popular_classes'     => $popularClasses,
                'status_distribution' => $statusDistribution,
            ],
            'tables' => [
                'instructor_load' => $instructorLoad,
            ],
        ];
    }

    // ============================================================================
    // 7. PT SESSIONS REPORT
    // ============================================================================
    public function getPtSessionReport(string $branchId, Carbon $start, Carbon $end): array
    {
        $totalSessions = DB::table('pt_sessions')
            ->where('branch_id', $branchId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->count();

        $completedSessions = DB::table('pt_sessions')
            ->where('branch_id', $branchId)
            ->where('status', 'completed')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->count();

        $cancelledSessions = DB::table('pt_sessions')
            ->where('branch_id', $branchId)
            ->where('status', 'cancelled')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->count();

        $completionRate = $totalSessions > 0 ? round(($completedSessions / $totalSessions) * 100, 1) : 0;

        // Status distribution
        $statusDistribution = DB::table('pt_sessions')
            ->where('branch_id', $branchId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw("status as name, COUNT(*) as value")
            ->groupBy('status')
            ->get();

        // Trainer utilization
        $trainerUtilization = DB::table('pt_sessions')
            ->join('staffs', 'pt_sessions.trainer_id', '=', 'staffs.id')
            ->where('pt_sessions.branch_id', $branchId)
            ->whereBetween('pt_sessions.date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw("staffs.name, COUNT(pt_sessions.id) as total_sessions, SUM(CASE WHEN pt_sessions.status = 'completed' THEN 1 ELSE 0 END) as completed")
            ->groupBy('staffs.id', 'staffs.name')
            ->orderByDesc('total_sessions')
            ->get()
            ->map(fn($item) => [
                'name'           => $item->name,
                'total_sessions' => (int) $item->total_sessions,
                'completed'      => (int) $item->completed,
            ]);

        return [
            'summary' => [
                'total_sessions'    => $totalSessions,
                'completed_sessions'=> $completedSessions,
                'cancelled_sessions'=> $cancelledSessions,
                'completion_rate'   => $completionRate,
            ],
            'charts' => [
                'status_distribution' => $statusDistribution,
            ],
            'tables' => [
                'trainer_utilization' => $trainerUtilization,
            ],
        ];
    }

    // ============================================================================
    // 8. FACILITY REPORT
    // ============================================================================
    public function getFacilityReport(string $branchId, Carbon $start, Carbon $end): array
    {
        $totalBookings = DB::table('facility_bookings')
            ->where('branch_id', $branchId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->count();

        $completedBookings = DB::table('facility_bookings')
            ->where('branch_id', $branchId)->where('status', 'completed')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->count();

        $cancelledBookings = DB::table('facility_bookings')
            ->where('branch_id', $branchId)->where('status', 'cancelled')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->count();

        $noShowBookings = DB::table('facility_bookings')
            ->where('branch_id', $branchId)->where('status', 'no_show')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->count();

        // Popular facilities
        $popularFacilities = DB::table('facility_bookings')
            ->join('facilities', 'facility_bookings.facility_id', '=', 'facilities.id')
            ->where('facility_bookings.branch_id', $branchId)
            ->whereBetween('facility_bookings.date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw('facilities.name, COUNT(facility_bookings.id) as total_bookings')
            ->groupBy('facilities.id', 'facilities.name')
            ->orderByDesc('total_bookings')
            ->get()
            ->map(fn($item) => [
                'name'           => $item->name,
                'total_bookings' => (int) $item->total_bookings,
            ]);

        // Status distribution
        $statusDistribution = DB::table('facility_bookings')
            ->where('branch_id', $branchId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw("status as name, COUNT(*) as value")
            ->groupBy('status')
            ->get();

        return [
            'summary' => [
                'total_bookings'     => $totalBookings,
                'completed_bookings' => $completedBookings,
                'cancelled_bookings' => $cancelledBookings,
                'no_show_bookings'   => $noShowBookings,
            ],
            'charts' => [
                'popular_facilities'  => $popularFacilities,
                'status_distribution' => $statusDistribution,
            ],
        ];
    }

    // ============================================================================
    // 9. FINANCE SALES REPORT
    // ============================================================================
    public function getFinanceSalesReport(string $branchId, Carbon $start, Carbon $end): array
    {
        $invoicesQuery = DB::table('tenant_invoices')
            ->where('tenant_invoices.branch_id', $branchId)
            ->where('tenant_invoices.status', 'paid')
            ->whereBetween('tenant_invoices.paid_at', [$start, $end]);

        $totalRevenue      = (clone $invoicesQuery)->sum('total_amount');
        $totalTransactions = (clone $invoicesQuery)->count();

        // Pending invoices (outstanding)
        $pendingRevenue = DB::table('tenant_invoices')
            ->where('branch_id', $branchId)
            ->where('status', 'pending')
            ->sum('total_amount');
        $pendingCount = DB::table('tenant_invoices')
            ->where('branch_id', $branchId)
            ->where('status', 'pending')
            ->count();

        // Payment method distribution
        $revenueByMethod = (clone $invoicesQuery)
            ->selectRaw("COALESCE(payment_method, 'other') as name, SUM(total_amount) as value")
            ->groupBy('payment_method')
            ->get();

        // Daily revenue trend
        $dailyTrend = (clone $invoicesQuery)
            ->selectRaw('CAST(paid_at AS date) as date, SUM(total_amount) as revenue')
            ->groupBy(DB::raw('CAST(paid_at AS date)'))
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date'    => Carbon::parse($item->date)->translatedFormat('d M'),
                'revenue' => (float) $item->revenue,
            ]);

        // Top revenue items (from invoice_items)
        $topItems = DB::table('tenant_invoice_items')
            ->join('tenant_invoices', 'tenant_invoice_items.tenant_invoice_id', '=', 'tenant_invoices.id')
            ->where('tenant_invoices.branch_id', $branchId)
            ->where('tenant_invoices.status', 'paid')
            ->whereBetween('tenant_invoices.paid_at', [$start, $end])
            ->selectRaw('tenant_invoice_items.item_type, tenant_invoice_items.item_name, SUM(tenant_invoice_items.total_price) as revenue, SUM(tenant_invoice_items.quantity) as qty')
            ->groupBy('tenant_invoice_items.item_type', 'tenant_invoice_items.item_name')
            ->orderByDesc('revenue')
            ->take(10)
            ->get()
            ->map(fn($item) => [
                'item_type'       => $item->item_type,
                'item_type_label' => $this->itemTypeLabel($item->item_type),
                'item_name'       => $item->item_name,
                'revenue'         => (float) $item->revenue,
                'qty'             => (int) $item->qty,
            ]);

        // Recent transactions
        $recentTransactions = (clone $invoicesQuery)
            ->join('members', 'tenant_invoices.member_id', '=', 'members.id')
            ->select(
                'tenant_invoices.invoice_number',
                'tenant_invoices.total_amount',
                'tenant_invoices.payment_method',
                'tenant_invoices.paid_at',
                'members.name as member_name'
            )
            ->latest('tenant_invoices.paid_at')
            ->take(10)
            ->get();

        return [
            'summary' => [
                'total_revenue'      => (float) $totalRevenue,
                'total_transactions' => $totalTransactions,
                'pending_revenue'    => (float) $pendingRevenue,
                'pending_count'      => $pendingCount,
            ],
            'charts' => [
                'revenue_trend'     => $dailyTrend,
                'revenue_by_method' => $revenueByMethod,
                'top_items'         => $topItems,
            ],
            'tables' => [
                'recent_transactions' => $recentTransactions,
            ],
        ];
    }

    // ============================================================================
    // 10. POS & PRODUCT REPORT
    // ============================================================================
    public function getPosProductReport(string $branchId, Carbon $start, Carbon $end): array
    {
        $productTypes = [\App\Models\Tenant\Product::class, 'product'];

        $productSalesQuery = DB::table('tenant_invoice_items')
            ->join('tenant_invoices', 'tenant_invoice_items.tenant_invoice_id', '=', 'tenant_invoices.id')
            ->leftJoin('products', 'tenant_invoice_items.item_id', '=', 'products.id')
            ->where('tenant_invoices.branch_id', $branchId)
            ->where('tenant_invoices.status', 'paid')
            ->whereIn('tenant_invoice_items.item_type', $productTypes)
            ->whereBetween('tenant_invoices.paid_at', [$start, $end]);

        $totalRevenue = (clone $productSalesQuery)->sum('tenant_invoice_items.total_price');
        $unitsSold = (clone $productSalesQuery)->sum('tenant_invoice_items.quantity');
        $grossProfit = (clone $productSalesQuery)
            ->selectRaw('COALESCE(SUM(tenant_invoice_items.total_price - (tenant_invoice_items.quantity * COALESCE(products.cost_price, 0))), 0) as gross_profit')
            ->value('gross_profit');

        $posTransactionsQuery = DB::table('tenant_invoices')
            ->where('tenant_invoices.branch_id', $branchId)
            ->where('tenant_invoices.status', 'paid')
            ->whereBetween('tenant_invoices.paid_at', [$start, $end])
            ->whereExists(function ($query) use ($productTypes) {
                $query->select(DB::raw(1))
                    ->from('tenant_invoice_items')
                    ->whereColumn('tenant_invoice_items.tenant_invoice_id', 'tenant_invoices.id')
                    ->whereIn('tenant_invoice_items.item_type', $productTypes);
            });

        $totalTransactions = (clone $posTransactionsQuery)->count();
        $averageOrderValue = $totalTransactions > 0 ? round($totalRevenue / $totalTransactions, 2) : 0;
        $grossMargin = $totalRevenue > 0 ? round(((float) $grossProfit / (float) $totalRevenue) * 100, 1) : 0;

        $lowStockCount = DB::table('products')
            ->where(fn($query) => $query->whereNull('branch_id')->orWhere('branch_id', $branchId))
            ->where('is_active', true)
            ->whereRaw('stock <= min_stock AND stock > 0')
            ->count();

        $outOfStockCount = DB::table('products')
            ->where(fn($query) => $query->whereNull('branch_id')->orWhere('branch_id', $branchId))
            ->where('is_active', true)
            ->where('stock', '<=', 0)
            ->count();

        $dailyProductSales = (clone $productSalesQuery)
            ->selectRaw('CAST(tenant_invoices.paid_at AS date) as date, SUM(tenant_invoice_items.total_price) as revenue, SUM(tenant_invoice_items.quantity) as qty')
            ->groupBy(DB::raw('CAST(tenant_invoices.paid_at AS date)'))
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date'    => Carbon::parse($item->date)->translatedFormat('d M'),
                'revenue' => (float) $item->revenue,
                'qty'     => (int) $item->qty,
            ]);

        $salesByCategory = (clone $productSalesQuery)
            ->selectRaw("COALESCE(products.category, 'Uncategorized') as name, SUM(tenant_invoice_items.total_price) as value")
            ->groupBy('products.category')
            ->orderByDesc('value')
            ->get()
            ->map(fn($item) => [
                'name'  => $item->name,
                'value' => (float) $item->value,
            ]);

        $paymentMethods = (clone $posTransactionsQuery)
            ->selectRaw("COALESCE(payment_method, 'other') as name, SUM(total_amount) as value")
            ->groupBy('payment_method')
            ->orderByDesc('value')
            ->get()
            ->map(fn($item) => [
                'name'  => $item->name,
                'value' => (float) $item->value,
            ]);

        $topProducts = (clone $productSalesQuery)
            ->selectRaw('tenant_invoice_items.item_id, tenant_invoice_items.item_name, COALESCE(products.category, tenant_invoice_items.item_type) as category, SUM(tenant_invoice_items.quantity) as qty, SUM(tenant_invoice_items.total_price) as revenue, COALESCE(SUM(tenant_invoice_items.total_price - (tenant_invoice_items.quantity * COALESCE(products.cost_price, 0))), 0) as gross_profit')
            ->groupBy('tenant_invoice_items.item_id', 'tenant_invoice_items.item_name', 'products.category', 'tenant_invoice_items.item_type')
            ->orderByDesc('revenue')
            ->take(10)
            ->get()
            ->map(fn($item) => [
                'item_id'      => $item->item_id,
                'item_name'    => $item->item_name,
                'category'     => $item->category,
                'qty'          => (int) $item->qty,
                'revenue'      => (float) $item->revenue,
                'gross_profit' => (float) $item->gross_profit,
            ]);

        $lowStockProducts = DB::table('products')
            ->where(fn($query) => $query->whereNull('branch_id')->orWhere('branch_id', $branchId))
            ->where('is_active', true)
            ->whereRaw('stock <= min_stock')
            ->select('name', 'code', 'category', 'stock', 'min_stock', 'unit')
            ->orderBy('stock')
            ->orderBy('name')
            ->take(10)
            ->get();

        $recentTransactions = (clone $posTransactionsQuery)
            ->leftJoin('members', 'tenant_invoices.member_id', '=', 'members.id')
            ->select(
                'tenant_invoices.invoice_number',
                'tenant_invoices.total_amount',
                'tenant_invoices.payment_method',
                'tenant_invoices.paid_at',
                DB::raw("COALESCE(members.name, tenant_invoices.guest_name, 'Walk-In Customer') as customer_name")
            )
            ->latest('tenant_invoices.paid_at')
            ->take(10)
            ->get();

        return [
            'summary' => [
                'total_revenue'      => (float) $totalRevenue,
                'total_transactions' => $totalTransactions,
                'units_sold'         => (int) $unitsSold,
                'average_order_value'=> $averageOrderValue,
                'gross_profit'       => (float) $grossProfit,
                'gross_margin'       => $grossMargin,
                'low_stock_count'    => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
            ],
            'charts' => [
                'daily_product_sales' => $dailyProductSales,
                'sales_by_category'   => $salesByCategory,
                'payment_methods'     => $paymentMethods,
            ],
            'tables' => [
                'top_products'        => $topProducts,
                'low_stock_products'  => $lowStockProducts,
                'recent_transactions' => $recentTransactions,
            ],
        ];
    }
}
