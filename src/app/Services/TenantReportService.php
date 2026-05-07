<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TenantReportService
{
    // ============================================================================
    // 1. LAPORAN KEUANGAN (FINANCE)
    // Fokus: Pendapatan dari tenant_invoices, distribusi metode bayar, tren harian.
    // ============================================================================
    public function getFinanceReport(Carbon $start, Carbon $end, ?string $branchId = null): array
    {
        $invoicesQuery = DB::table('tenant_invoices')
            ->where('tenant_invoices.status', 'paid')
            ->whereBetween('tenant_invoices.paid_at', [$start, $end]);

        if ($branchId) {
            $invoicesQuery->where('tenant_invoices.branch_id', $branchId);
        }

        // Total Pendapatan
        $totalRevenue = (clone $invoicesQuery)->sum('total_amount');

        // Total Transaksi
        $totalTransactions = (clone $invoicesQuery)->count();

        // Distribusi Metode Pembayaran (Pie Chart)
        $revenueByMethod = (clone $invoicesQuery)
            ->selectRaw("COALESCE(payment_method, 'other') as name, SUM(total_amount) as value")
            ->groupBy('payment_method')
            ->get();

        // Tren Pendapatan Harian (Line Chart)
        $dailyTrend = (clone $invoicesQuery)
            ->selectRaw('DATE(paid_at) as date, SUM(total_amount) as revenue')
            ->groupBy(DB::raw('DATE(paid_at)'))
            ->orderBy('date', 'asc')
            ->get()
            ->map(fn($item) => [
                'date'    => Carbon::parse($item->date)->translatedFormat('d M'),
                'revenue' => (float) $item->revenue,
            ]);

        // Top 5 Branch by Revenue (Bar Chart) — hanya tampilkan jika mode all-branches
        $topBranches = collect();
        if (!$branchId) {
            $topBranches = (clone $invoicesQuery)
                ->join('branches', 'tenant_invoices.branch_id', '=', 'branches.id')
                ->selectRaw('branches.name, SUM(tenant_invoices.total_amount) as revenue')
                ->groupBy('branches.id', 'branches.name')
                ->orderByDesc('revenue')
                ->take(5)
                ->get()
                ->map(fn($item) => [
                    'name'    => $item->name,
                    'revenue' => (float) $item->revenue,
                ]);
        }

        // 10 Transaksi Terakhir
        $recentTransactions = (clone $invoicesQuery)
            ->join('members', 'tenant_invoices.member_id', '=', 'members.id')
            ->leftJoin('branches', 'tenant_invoices.branch_id', '=', 'branches.id')
            ->select(
                'tenant_invoices.invoice_number',
                'tenant_invoices.total_amount',
                'tenant_invoices.payment_method',
                'tenant_invoices.paid_at',
                'members.name as member_name',
                'branches.name as branch_name'
            )
            ->latest('tenant_invoices.paid_at')
            ->take(10)
            ->get();

        return [
            'summary' => [
                'total_revenue'      => (float) $totalRevenue,
                'total_transactions' => $totalTransactions,
            ],
            'charts' => [
                'revenue_trend'     => $dailyTrend,
                'revenue_by_method' => $revenueByMethod,
                'top_branches'      => $topBranches,
            ],
            'tables' => [
                'recent_transactions' => $recentTransactions,
            ],
            'meta' => [
                'is_filtered' => (bool) $branchId,
            ],
        ];
    }

    // ============================================================================
    // 2. LAPORAN MEMBER (GROWTH)
    // Fokus: Pertumbuhan member, churn, distribusi membership plan.
    // ============================================================================
    public function getMemberReport(Carbon $start, Carbon $end, ?string $branchId = null): array
    {
        // Member Baru di periode ini
        $newMembersQuery = DB::table('members')
            ->whereBetween('created_at', [$start, $end]);
        if ($branchId) {
            $newMembersQuery->where('home_branch_id', $branchId);
        }
        $newMembersCount = (clone $newMembersQuery)->count();

        // Member Churn: yang status-nya berubah ke expired/inactive/banned di periode ini
        $churnedQuery = DB::table('members')
            ->whereIn('status', ['expired', 'banned'])
            ->whereBetween('updated_at', [$start, $end]);
        if ($branchId) {
            $churnedQuery->where('home_branch_id', $branchId);
        }
        $churnedMembersCount = $churnedQuery->count();

        $netGrowth = $newMembersCount - $churnedMembersCount;

        // Tren Pendaftaran Harian (Area Chart)
        $dailyRegQuery = DB::table('members')
            ->whereBetween('created_at', [$start, $end]);
        if ($branchId) {
            $dailyRegQuery->where('home_branch_id', $branchId);
        }
        $dailyRegistration = $dailyRegQuery
            ->selectRaw('DATE(created_at) as date, COUNT(id) as total')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get()
            ->map(fn($item) => [
                'date'  => Carbon::parse($item->date)->translatedFormat('d M'),
                'total' => (int) $item->total,
            ]);

        // Distribusi Membership Plan Aktif (Pie Chart)
        $planDistQuery = DB::table('memberships')
            ->join('membership_plans', 'memberships.membership_plan_id', '=', 'membership_plans.id')
            ->where('memberships.status', 'active');
        if ($branchId) {
            $planDistQuery->where('memberships.branch_id', $branchId);
        }
        $planDistribution = $planDistQuery
            ->selectRaw('membership_plans.name, COUNT(memberships.id) as value')
            ->groupBy('membership_plans.id', 'membership_plans.name')
            ->get();

        // Distribusi Member per Branch (Pie Chart) — hanya tampilkan jika mode all-branches
        $branchDistribution = collect();
        if (!$branchId) {
            $branchDistribution = DB::table('members')
                ->join('branches', 'members.home_branch_id', '=', 'branches.id')
                ->where('members.is_active', true)
                ->selectRaw('branches.name, COUNT(members.id) as value')
                ->groupBy('branches.id', 'branches.name')
                ->get();
        }

        // Daftar Member Baru
        $newMembersListQuery = DB::table('members')
            ->leftJoin('branches', 'members.home_branch_id', '=', 'branches.id')
            ->whereBetween('members.created_at', [$start, $end]);
        if ($branchId) {
            $newMembersListQuery->where('members.home_branch_id', $branchId);
        }
        $newMembersList = $newMembersListQuery
            ->select(
                'members.name',
                'members.email',
                'members.phone',
                'members.status',
                'members.created_at',
                'branches.name as branch_name'
            )
            ->orderBy('members.created_at', 'desc')
            ->get()
            ->map(fn($item) => [
                'name'        => $item->name,
                'email'       => $item->email,
                'phone'       => $item->phone,
                'status'      => $item->status,
                'branch_name' => $item->branch_name ?? '-',
                'created_at'  => Carbon::parse($item->created_at)->translatedFormat('d M Y'),
            ]);

        return [
            'summary' => [
                'new_members'     => $newMembersCount,
                'churned_members' => $churnedMembersCount,
                'net_growth'      => $netGrowth,
            ],
            'charts' => [
                'registration_trend'  => $dailyRegistration,
                'plan_distribution'   => $planDistribution,
                'branch_distribution' => $branchDistribution,
            ],
            'tables' => [
                'new_members' => $newMembersList,
            ],
            'meta' => [
                'is_filtered' => (bool) $branchId,
            ],
        ];
    }

    // ============================================================================
    // 3. LAPORAN MEMBERSHIP (SUBSCRIPTION ACTIVITY)
    // Fokus: Membership aktif, expiring, frozen, distribusi plan.
    // ============================================================================
    public function getMembershipReport(Carbon $start, Carbon $end, ?string $branchId = null): array
    {
        $activeQuery = DB::table('memberships')->where('status', 'active');
        $frozenQuery = DB::table('memberships')->where('status', 'frozen');
        $expiredQuery = DB::table('memberships')
            ->where('status', 'expired')
            ->whereBetween('end_date', [$start, $end]);

        if ($branchId) {
            $activeQuery->where('branch_id', $branchId);
            $frozenQuery->where('branch_id', $branchId);
            $expiredQuery->where('branch_id', $branchId);
        }

        $activeMemberships = $activeQuery->count();
        $frozenMemberships = $frozenQuery->count();
        $expiredInPeriod   = $expiredQuery->count();

        // Distribusi Plan Membership Aktif (Pie Chart)
        $planDistQuery = DB::table('memberships')
            ->join('membership_plans', 'memberships.membership_plan_id', '=', 'membership_plans.id')
            ->where('memberships.status', 'active');
        if ($branchId) {
            $planDistQuery->where('memberships.branch_id', $branchId);
        }
        $planDistribution = $planDistQuery
            ->selectRaw('membership_plans.name, COUNT(memberships.id) as value')
            ->groupBy('membership_plans.id', 'membership_plans.name')
            ->get()
            ->map(fn($item) => [
                'name'  => $item->name,
                'value' => (int) $item->value,
            ]);

        // Membership yang akan expired dalam 7 hari (Risiko Churn)
        $expiringSoonQuery = DB::table('memberships')
            ->join('members', 'memberships.member_id', '=', 'members.id')
            ->join('membership_plans', 'memberships.membership_plan_id', '=', 'membership_plans.id')
            ->leftJoin('branches', 'memberships.branch_id', '=', 'branches.id')
            ->where('memberships.status', 'active')
            ->whereBetween('memberships.end_date', [now(), now()->addDays(7)]);
        if ($branchId) {
            $expiringSoonQuery->where('memberships.branch_id', $branchId);
        }
        $expiringSoon = $expiringSoonQuery
            ->select(
                'members.name as member_name',
                'membership_plans.name as plan_name',
                'branches.name as branch_name',
                'memberships.end_date'
            )
            ->orderBy('memberships.end_date', 'asc')
            ->get()
            ->map(fn($item) => [
                'member_name' => $item->member_name,
                'plan_name'   => $item->plan_name,
                'branch_name' => $item->branch_name ?? '-',
                'ends_at'     => Carbon::parse($item->end_date)->translatedFormat('d M Y'),
                'days_left'   => (int) Carbon::parse($item->end_date)->diffInDays(now()),
            ]);

        // Membership Frozen (untuk tabel follow-up)
        $frozenListQuery = DB::table('memberships')
            ->join('members', 'memberships.member_id', '=', 'members.id')
            ->join('membership_plans', 'memberships.membership_plan_id', '=', 'membership_plans.id')
            ->where('memberships.status', 'frozen');
        if ($branchId) {
            $frozenListQuery->where('memberships.branch_id', $branchId);
        }
        $frozenList = $frozenListQuery
            ->select(
                'members.name as member_name',
                'membership_plans.name as plan_name',
                'memberships.frozen_at',
                'memberships.frozen_until'
            )
            ->orderBy('memberships.frozen_until', 'asc')
            ->take(10)
            ->get()
            ->map(fn($item) => [
                'member_name'  => $item->member_name,
                'plan_name'    => $item->plan_name,
                'frozen_at'    => $item->frozen_at ? Carbon::parse($item->frozen_at)->translatedFormat('d M Y') : '-',
                'frozen_until' => $item->frozen_until ? Carbon::parse($item->frozen_until)->translatedFormat('d M Y') : '-',
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
                'frozen_list'   => $frozenList,
            ],
            'meta' => [
                'is_filtered' => (bool) $branchId,
            ],
        ];
    }

    // ============================================================================
    // DATA EXPORT (CSV)
    // ============================================================================

    public function getFinanceExportData(Carbon $start, Carbon $end, ?string $branchId = null)
    {
        $query = DB::table('tenant_invoices')
            ->join('members', 'tenant_invoices.member_id', '=', 'members.id')
            ->leftJoin('branches', 'tenant_invoices.branch_id', '=', 'branches.id')
            ->where('tenant_invoices.status', 'paid')
            ->whereBetween('tenant_invoices.paid_at', [$start, $end]);

        if ($branchId) {
            $query->where('tenant_invoices.branch_id', $branchId);
        }

        return $query
            ->select(
                'tenant_invoices.invoice_number',
                'members.name as member_name',
                'branches.name as branch_name',
                'tenant_invoices.payment_method',
                'tenant_invoices.total_amount',
                'tenant_invoices.paid_at'
            )
            ->orderBy('tenant_invoices.paid_at', 'desc')
            ->get();
    }

    public function getMemberExportData(Carbon $start, Carbon $end, ?string $branchId = null)
    {
        $query = DB::table('members')
            ->leftJoin('branches', 'members.home_branch_id', '=', 'branches.id')
            ->whereBetween('members.created_at', [$start, $end]);

        if ($branchId) {
            $query->where('members.home_branch_id', $branchId);
        }

        return $query
            ->select(
                'members.name',
                'members.email',
                'members.phone',
                'members.status',
                'branches.name as branch_name',
                'members.created_at'
            )
            ->orderBy('members.created_at', 'desc')
            ->get();
    }

    public function getMembershipExportData(?string $branchId = null)
    {
        $query = DB::table('memberships')
            ->join('members', 'memberships.member_id', '=', 'members.id')
            ->join('membership_plans', 'memberships.membership_plan_id', '=', 'membership_plans.id')
            ->leftJoin('branches', 'memberships.branch_id', '=', 'branches.id')
            ->where('memberships.status', 'active');

        if ($branchId) {
            $query->where('memberships.branch_id', $branchId);
        }

        return $query
            ->select(
                'members.name as member_name',
                'membership_plans.name as plan_name',
                'branches.name as branch_name',
                'memberships.status',
                'memberships.start_date',
                'memberships.end_date'
            )
            ->orderBy('memberships.end_date', 'asc')
            ->get();
    }

    // ============================================================================
    // BRANCH LIST (untuk dropdown di FE Owner Report)
    // ============================================================================

    public function getActiveBranches(): \Illuminate\Support\Collection
    {
        return DB::table('branches')
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();
    }
}
