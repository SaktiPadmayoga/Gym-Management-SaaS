<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TenantDashboardService
{
    /**
     * Mengambil semua data untuk Owner Dashboard (tanpa branchId = semua cabang)
     */
    public function getDashboardData(?string $branchId = null): array
    {
        return [
            'summary'               => $this->getSummaryMetrics($branchId),
            'revenue_chart'         => $this->getRevenueChart(6, $branchId),
            'branch_performance'    => $this->getBranchPerformance($branchId),
            'expiring_memberships'  => $this->getExpiringMemberships(7, $branchId),
            'recent_check_ins'      => $this->getRecentCheckIns($branchId),
            'recent_transactions'   => $this->getRecentTransactions($branchId),
        ];
    }

    private function getSummaryMetrics(?string $branchId): array
    {
        $now            = now();
        $today          = $now->toDateString();
        $yesterday      = $now->copy()->subDay()->toDateString();
        $thisYear       = $now->year;
        $thisMonth      = $now->month;
        $lastMonthStart = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $lastMonthEnd   = $now->copy()->subMonthNoOverflow()->endOfMonth();

        // ── 1. Total Active Members ──────────────────────────────────
        $membersQ = DB::table('members')
            ->where('is_active', true)
            ->whereIn('status', ['active', 'inactive']);
        if ($branchId) $membersQ->where('home_branch_id', $branchId);
        $totalMembers = $membersQ->count();

        // ── 2. New Members This Month ────────────────────────────────
        $newMQ = DB::table('members')
            ->whereYear('created_at', $thisYear)
            ->whereMonth('created_at', $thisMonth);
        if ($branchId) $newMQ->where('home_branch_id', $branchId);
        $newMembersThisMonth = $newMQ->count();

        // ── 3. New Members Last Month (for % growth) ─────────────────
        $newMLastQ = DB::table('members')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd]);
        if ($branchId) $newMLastQ->where('home_branch_id', $branchId);
        $newMembersLastMonth = $newMLastQ->count();

        // ── 4. Active Memberships ────────────────────────────────────
        $msQ = DB::table('memberships')->where('status', 'active');
        if ($branchId) $msQ->where('branch_id', $branchId);
        $activeMemberships = $msQ->count();

        // ── 5. Frozen Memberships ────────────────────────────────────
        $frozenQ = DB::table('memberships')->where('status', 'frozen');
        if ($branchId) $frozenQ->where('branch_id', $branchId);
        $frozenCount = $frozenQ->count();

        // ── 6. Expiring Soon (≤7 days) ───────────────────────────────
        $expiringQ = DB::table('memberships')
            ->where('status', 'active')
            ->whereDate('end_date', '>=', $today)
            ->whereDate('end_date', '<=', $now->copy()->addDays(7)->toDateString());
        if ($branchId) $expiringQ->where('branch_id', $branchId);
        $expiringSoonCount = $expiringQ->count();

        // ── 7. Check-ins Today ───────────────────────────────────────
        $ciTodayQ = DB::table('check_ins')
            ->where('status', 'success')
            ->whereDate('checked_in_at', $today);
        if ($branchId) $ciTodayQ->where('branch_id', $branchId);
        $checkInsToday = $ciTodayQ->count();

        // ── 8. Check-ins Yesterday (for % growth) ───────────────────
        $ciYestQ = DB::table('check_ins')
            ->where('status', 'success')
            ->whereDate('checked_in_at', $yesterday);
        if ($branchId) $ciYestQ->where('branch_id', $branchId);
        $checkInsYesterday = $ciYestQ->count();

        // ── 9. Revenue This Month ────────────────────────────────────
        $revThisQ = DB::table('tenant_invoices')
            ->where('status', 'paid')
            ->whereYear('paid_at', $thisYear)
            ->whereMonth('paid_at', $thisMonth);
        if ($branchId) $revThisQ->where('branch_id', $branchId);
        $revenueThisMonth = (float) $revThisQ->sum('total_amount');

        // ── 10. Revenue Last Month (for % growth) ────────────────────
        $revLastQ = DB::table('tenant_invoices')
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$lastMonthStart, $lastMonthEnd]);
        if ($branchId) $revLastQ->where('branch_id', $branchId);
        $revenueLastMonth = (float) $revLastQ->sum('total_amount');

        // ── 11. Pending Transactions ─────────────────────────────────
        $pendingQ = DB::table('tenant_invoices')->where('status', 'pending');
        if ($branchId) $pendingQ->where('branch_id', $branchId);
        $pendingTransactions = $pendingQ->count();

        // ── 12. Classes Today ────────────────────────────────────────
        $classesQ = DB::table('class_schedules')
            ->whereDate('date', $today)
            ->whereIn('status', ['scheduled', 'ongoing']);
        if ($branchId) $classesQ->where('branch_id', $branchId);
        $upcomingClassesToday = $classesQ->count();

        // ── 13. PT Sessions Today ────────────────────────────────────
        $ptQ = DB::table('pt_sessions')
            ->whereDate('date', $today)
            ->whereIn('status', ['scheduled', 'ongoing']);
        if ($branchId) $ptQ->where('branch_id', $branchId);
        $ptSessionsToday = $ptQ->count();

        // ── 14. Total Active Branches ────────────────────────────────
        $branchCount = DB::table('branches')->where('is_active', true)->count();

        return [
            // Existing
            'total_members'            => $totalMembers,
            'new_members_this_month'   => $newMembersThisMonth,
            'new_members_last_month'   => $newMembersLastMonth,
            'active_memberships'       => $activeMemberships,
            'frozen_count'             => $frozenCount,
            'expiring_soon_count'      => $expiringSoonCount,
            'check_ins_today'          => $checkInsToday,
            'check_ins_yesterday'      => $checkInsYesterday,
            'revenue_this_month'       => $revenueThisMonth,
            'revenue_last_month'       => $revenueLastMonth,
            'pending_transactions'     => $pendingTransactions,
            'upcoming_classes_today'   => $upcomingClassesToday,
            'pt_sessions_today'        => $ptSessionsToday,
            'total_branches'           => $branchCount,
        ];
    }

    private function getRevenueChart(int $monthsAgo, ?string $branchId): array
    {
        $chartData = [];

        for ($i = $monthsAgo - 1; $i >= 0; $i--) {
            $targetMonth = now()->subMonthsNoOverflow($i);

            $query = DB::table('tenant_invoices')
                ->where('status', 'paid')
                ->whereYear('paid_at', $targetMonth->year)
                ->whereMonth('paid_at', $targetMonth->month);

            if ($branchId) $query->where('branch_id', $branchId);

            $chartData[] = [
                'month'   => $targetMonth->translatedFormat('M Y'),
                'revenue' => (float) $query->sum('total_amount'),
            ];
        }

        return $chartData;
    }

    /**
     * Performa ringkas per cabang — member, check-in hari ini, revenue bulan ini.
     * Jika branchId tersedia, kembalikan array tunggal untuk cabang itu saja.
     */
    private function getBranchPerformance(?string $branchId): array
    {
        $now   = now();
        $today = $now->toDateString();

        $branchesQuery = DB::table('branches')->where('is_active', true)->select('id', 'name');
        if ($branchId) $branchesQuery->where('id', $branchId);
        $branches = $branchesQuery->get();

        $result = [];

        foreach ($branches as $branch) {
            $bid = $branch->id;

            $members = DB::table('members')
                ->where('is_active', true)
                ->whereIn('status', ['active', 'inactive'])
                ->where('home_branch_id', $bid)
                ->count();

            $checkIns = DB::table('check_ins')
                ->where('branch_id', $bid)
                ->where('status', 'success')
                ->whereDate('checked_in_at', $today)
                ->count();

            $revenue = (float) DB::table('tenant_invoices')
                ->where('branch_id', $bid)
                ->where('status', 'paid')
                ->whereYear('paid_at', $now->year)
                ->whereMonth('paid_at', $now->month)
                ->sum('total_amount');

            $activeMemberships = DB::table('memberships')
                ->where('branch_id', $bid)
                ->where('status', 'active')
                ->count();

            $result[] = [
                'id'                => $bid,
                'name'              => $branch->name,
                'members_count'     => $members,
                'check_ins_today'   => $checkIns,
                'revenue_this_month'=> $revenue,
                'active_memberships'=> $activeMemberships,
            ];
        }

        // Sort by revenue descending
        usort($result, fn($a, $b) => $b['revenue_this_month'] <=> $a['revenue_this_month']);

        return $result;
    }

    /**
     * Daftar membership yang akan kedaluwarsa dalam $days hari ke depan.
     */
    private function getExpiringMemberships(int $days, ?string $branchId): array
    {
        $today  = now()->toDateString();
        $future = now()->addDays($days)->toDateString();

        $query = DB::table('memberships')
            ->join('members', 'memberships.member_id', '=', 'members.id')
            ->join('branches', 'memberships.branch_id', '=', 'branches.id')
            ->leftJoin('membership_plans', 'memberships.membership_plan_id', '=', 'membership_plans.id')
            ->where('memberships.status', 'active')
            ->whereDate('memberships.end_date', '>=', $today)
            ->whereDate('memberships.end_date', '<=', $future)
            ->select(
                'members.name as member_name',
                'membership_plans.name as plan_name',
                'branches.name as branch_name',
                'memberships.end_date as ends_at'
            );

        if ($branchId) $query->where('memberships.branch_id', $branchId);

        return $query->orderBy('memberships.end_date')
            ->take(10)
            ->get()
            ->map(function ($item) {
                return [
                    'member_name' => $item->member_name,
                    'plan_name'   => $item->plan_name,
                    'branch_name' => $item->branch_name,
                    'ends_at'     => $item->ends_at,
                    'days_left'   => (int) ceil(now()->diffInDays(Carbon::parse($item->ends_at), false)),
                ];
            })
            ->toArray();
    }

    private function getRecentCheckIns(?string $branchId): array
    {
        $query = DB::table('check_ins')
            ->join('members', 'check_ins.member_id', '=', 'members.id')
            ->join('branches', 'check_ins.branch_id', '=', 'branches.id')
            ->select(
                'check_ins.id',
                'members.name as member_name',
                'members.avatar as member_avatar',
                'branches.name as branch_name',
                'check_ins.checked_in_at',
                'check_ins.status'
            )
            ->where('check_ins.status', 'success');

        if ($branchId) $query->where('check_ins.branch_id', $branchId);

        return $query->latest('check_ins.checked_in_at')->take(8)->get()->toArray();
    }

    private function getRecentTransactions(?string $branchId): array
    {
        $query = DB::table('tenant_invoices')
            ->join('members', 'tenant_invoices.member_id', '=', 'members.id')
            ->join('branches', 'tenant_invoices.branch_id', '=', 'branches.id')
            ->select(
                'tenant_invoices.id',
                'tenant_invoices.invoice_number',
                'tenant_invoices.total_amount',
                'tenant_invoices.payment_method',
                'tenant_invoices.status',
                'tenant_invoices.paid_at',
                'members.name as member_name',
                'branches.name as branch_name'
            );

        if ($branchId) $query->where('tenant_invoices.branch_id', $branchId);

        return $query->latest('tenant_invoices.created_at')->take(8)->get()->toArray();
    }
}
