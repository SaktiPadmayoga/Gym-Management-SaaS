<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TenantDashboardService
{
    /**
     * Mengambil semua data untuk Dashboard Tenant (Branch-scoped)
     */
    public function getDashboardData(?string $branchId = null): array
    {
        return [
            'summary'             => $this->getSummaryMetrics($branchId),
            'revenue_chart'       => $this->getRevenueChart(6, $branchId),
            'recent_check_ins'    => $this->getRecentCheckIns($branchId),
            'recent_transactions' => $this->getRecentTransactions($branchId),
        ];
    }

    private function getSummaryMetrics(?string $branchId): array
    {
        $now = now();

        // 1. Total Active Members
        $membersQuery = DB::table('members')
            ->where('is_active', true)
            ->whereIn('status', ['active', 'inactive']);

        if ($branchId) {
            $membersQuery->where('home_branch_id', $branchId);
        }
        $totalMembers = $membersQuery->count();

        // 2. New Members This Month
        $newMembersQuery = DB::table('members')
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month);

        if ($branchId) {
            $newMembersQuery->where('home_branch_id', $branchId);
        }
        $newMembersThisMonth = $newMembersQuery->count();

        // 3. Active Memberships
        $membershipsQuery = DB::table('memberships')
            ->where('status', 'active');

        if ($branchId) {
            $membershipsQuery->where('branch_id', $branchId);
        }
        $activeMemberships = $membershipsQuery->count();

        // 4. Check-ins Today
        $checkInsQuery = DB::table('check_ins')
            ->where('status', 'success')
            ->whereDate('checked_in_at', $now->toDateString());

        if ($branchId) {
            $checkInsQuery->where('branch_id', $branchId);
        }
        $checkInsToday = $checkInsQuery->count();

        // 5. Revenue This Month (dari tenant_invoices yang paid)
        $revenueQuery = DB::table('tenant_invoices')
            ->where('status', 'paid')
            ->whereYear('paid_at', $now->year)
            ->whereMonth('paid_at', $now->month);

        if ($branchId) {
            $revenueQuery->where('branch_id', $branchId);
        }
        $revenueThisMonth = $revenueQuery->sum('total_amount');

        // 6. Upcoming Classes Today
        $classesQuery = DB::table('class_schedules')
            ->whereDate('date', $now->toDateString())
            ->whereIn('status', ['scheduled', 'ongoing']);

        if ($branchId) {
            $classesQuery->where('branch_id', $branchId);
        }
        $upcomingClassesToday = $classesQuery->count();

        return [
            'total_members'          => $totalMembers,
            'new_members_this_month' => $newMembersThisMonth,
            'active_memberships'     => $activeMemberships,
            'check_ins_today'        => $checkInsToday,
            'revenue_this_month'     => (float) $revenueThisMonth,
            'upcoming_classes_today' => $upcomingClassesToday,
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

            if ($branchId) {
                $query->where('branch_id', $branchId);
            }

            $totalRevenue = $query->sum('total_amount');

            $chartData[] = [
                'month'   => $targetMonth->translatedFormat('M Y'),
                'revenue' => (float) $totalRevenue,
            ];
        }

        return $chartData;
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

        if ($branchId) {
            $query->where('check_ins.branch_id', $branchId);
        }

        return $query
            ->latest('check_ins.checked_in_at')
            ->take(5)
            ->get()
            ->toArray();
    }

    private function getRecentTransactions(?string $branchId): array
    {
        $query = DB::table('tenant_invoices')
            ->join('members', 'tenant_invoices.member_id', '=', 'members.id')
            ->select(
                'tenant_invoices.id',
                'tenant_invoices.invoice_number',
                'tenant_invoices.total_amount',
                'tenant_invoices.payment_method',
                'tenant_invoices.status',
                'tenant_invoices.paid_at',
                'members.name as member_name'
            );

        if ($branchId) {
            $query->where('tenant_invoices.branch_id', $branchId);
        }

        return $query
            ->latest('tenant_invoices.created_at')
            ->take(5)
            ->get()
            ->toArray();
    }
}
