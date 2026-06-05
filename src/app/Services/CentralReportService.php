<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CentralReportService
{
    // ============================================================================
    // 1. LAPORAN KEUANGAN (FINANCE)
    // Fokus: Pendapatan kotor, metode pembayaran yang disukai, tren uang masuk.
    // ============================================================================
    public function getFinanceReport(Carbon $start, Carbon $end): array
    {
        $paymentsQuery = DB::connection('central')->table('payments')
            ->where('payments.status', 'success')
            ->whereBetween('payments.paid_at', [$start, $end]);

        // Total Pendapatan di rentang waktu tersebut
        $totalRevenue = (clone $paymentsQuery)->sum('gross_amount');
        $totalTransactionsCount = (clone $paymentsQuery)->count();

        // Distribusi Metode Pembayaran (Pie Chart)
        $revenueByMethod = (clone $paymentsQuery)
            ->selectRaw("COALESCE(payments.payment_type, 'midtrans') as name, SUM(payments.gross_amount) as value")
            ->groupBy(DB::raw("COALESCE(payments.payment_type, 'midtrans')"))
            ->get();

        // Tren Pendapatan Harian (Line/Bar Chart)
        $dailyTrend = (clone $paymentsQuery)
            ->selectRaw('CAST(payments.paid_at AS DATE) as date, SUM(payments.gross_amount) as revenue')
            ->groupBy(DB::raw('CAST(payments.paid_at AS DATE)'))
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'date'    => Carbon::parse($item->date)->translatedFormat('d M'),
                    'revenue' => (float) $item->revenue
                ];
            });

        // 10 Transaksi Sukses Terakhir di periode ini (Untuk tabel rincian)
        $recentTransactions = (clone $paymentsQuery)
            ->join('tenants', 'payments.tenant_id', '=', 'tenants.id')
            ->select('payments.order_id', 'payments.gross_amount', 'payments.payment_type', 'payments.paid_at', 'tenants.name as tenant_name')
            ->latest('payments.paid_at')
            ->take(10)
            ->get();

        $topTenants = (clone $paymentsQuery)
            ->join('tenants', 'payments.tenant_id', '=', 'tenants.id')
            ->selectRaw('tenants.name, SUM(payments.gross_amount) as revenue')
            ->groupBy('tenants.id', 'tenants.name')
            ->orderByDesc('revenue')
            ->take(5)
            ->get()
            ->map(fn($item) => [
                'name'    => $item->name,
                'revenue' => (float) $item->revenue,
            ]);

        // MRR kalkulasi
        $mrrMonthly = DB::connection('central')->table('subscriptions')->where('status', 'active')->where('billing_cycle', 'monthly')->sum('amount');
        $mrrYearly  = DB::connection('central')->table('subscriptions')->where('status', 'active')->where('billing_cycle', 'yearly')->sum('amount');
        $currentMrr = $mrrMonthly + ($mrrYearly / 12);

        return [
            'summary' => [
                'total_revenue'      => (float) $totalRevenue,
                'total_transactions' => $totalTransactionsCount,
                'current_mrr'        => (float) $currentMrr,
                'current_arr'        => (float) ($currentMrr * 12),
            ],
            'charts' => [
                'revenue_trend'     => $dailyTrend,
                'revenue_by_method' => $revenueByMethod,
                'top_tenants'       => $topTenants,
            ],
            'tables' => [
                'recent_transactions' => $recentTransactions,
            ],
        ];
    }

    // ============================================================================
    // 2. LAPORAN PERTUMBUHAN & CHURN (GROWTH)
    // Fokus: Penambahan tenant baru vs tenant yang kabur (churn), dan distribusi paket.
    // ============================================================================
    public function getGrowthReport(Carbon $start, Carbon $end): array
    {
        // Tenant Baru di periode ini
        $newTenantsCount = DB::connection('central')->table('tenants')
            ->whereBetween('created_at', [$start, $end])
            ->count();

        // Churn: Tenant yang langganannya berakhir/dibatalkan di periode ini
        $churnedTenantsCount = DB::connection('central')->table('subscriptions')
            ->where('status', 'cancelled')
            ->whereBetween('canceled_at', [$start, $end])
            ->count();

        // Tren Pendaftaran Harian (Area Chart)
        $dailyAcquisition = DB::connection('central')->table('tenants')
            ->selectRaw('CAST(created_at AS DATE) as date, COUNT(id) as total')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy(DB::raw('CAST(created_at AS DATE)'))
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'date'  => Carbon::parse($item->date)->translatedFormat('d M'),
                    'total' => (int) $item->total
                ];
            });

        // Distribusi Paket Langganan Aktif (Pie/Donut Chart)
        // Menjawab: "Paket mana yang paling laris/jadi tulang punggung kita?"
        $planDistribution = DB::connection('central')->table('subscriptions')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->whereIn('subscriptions.status', ['active', 'trial'])
            ->selectRaw('plans.name, COUNT(subscriptions.id) as value')
            ->groupBy('plans.id', 'plans.name')
            ->get();

        $newTenantsList = DB::connection('central')->table('tenants')
            ->whereBetween('created_at', [$start, $end])
            ->select('name', 'slug', 'owner_name', 'owner_email', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($item) => [
                'name'        => $item->name,
                'owner_name'  => $item->owner_name,
                'owner_email' => $item->owner_email,
                'status'      => $item->status,
                'created_at'  => Carbon::parse($item->created_at)->translatedFormat('d M Y'),
            ]);

            $trialConvertedCount = DB::connection('central')->table('subscriptions')
                ->where('status', 'active')
                ->where('billing_cycle', '!=', null)
                ->whereBetween('updated_at', [$start, $end]) // asumsi updated_at berubah saat convert
                ->count();
            
            $totalTrialInPeriod = DB::connection('central')->table('subscriptions')
                ->where('status', 'trial')
                ->orWhere(function($q) use ($start, $end) {
                    $q->where('status', 'active')->whereBetween('updated_at', [$start, $end]);
                })
                ->count();
            
            $trialToPaidRate = $totalTrialInPeriod > 0
                ? round(($trialConvertedCount / $totalTrialInPeriod) * 100, 1)
                : 0;
            
            // Lalu update return value:
        return [
            'summary' => [
                'new_tenants'        => $newTenantsCount,
                'churned_tenants'    => $churnedTenantsCount,                    'net_growth'         => $newTenantsCount - $churnedTenantsCount,
                'trial_to_paid_rate' => $trialToPaidRate, // ← BARU (null-safe di FE jika tidak ada)
            ],
            'charts' => [
                'acquisition_trend' => $dailyAcquisition,
                'plan_distribution' => $planDistribution,
            ],
            'tables' => [
                'new_tenants' => $newTenantsList, // ← BARU
            ],
        ];
    }

    // ============================================================================
    // 3. LAPORAN AKTIVITAS LANGGANAN (SUBSCRIPTION)
    // Fokus: MRR, Status Langganan saat ini, dan Risiko Tenant yang mau habis masa aktifnya.
    // ============================================================================
    public function getSubscriptionReport(Carbon $start, Carbon $end): array
    {
        $activeSubsCount = DB::connection('central')->table('subscriptions')->where('status', 'active')->count();
        $trialSubsCount  = DB::connection('central')->table('subscriptions')->where('status', 'trial')->count();
    
        // MRR kalkulasi
        $mrrMonthly = DB::connection('central')->table('subscriptions')->where('status', 'active')->where('billing_cycle', 'monthly')->sum('amount');
        $mrrYearly  = DB::connection('central')->table('subscriptions')->where('status', 'active')->where('billing_cycle', 'yearly')->sum('amount');
        $currentMrr = $mrrMonthly + ($mrrYearly / 12);
    
        // ── BARU: Distribusi Billing Cycle (untuk Pie Chart di FE) ──────────────
        $billingCycle = DB::connection('central')->table('subscriptions')
            ->where('status', 'active')
            ->selectRaw('billing_cycle as name, COUNT(id) as value')
            ->groupBy('billing_cycle')
            ->get()
            ->map(fn($item) => [
                'name'  => ucfirst($item->name), // "monthly" → "Monthly"
                'value' => (int) $item->value,
            ]);
    
        // Risiko Churn: Aktif yang akan expired dalam 7 hari
        $expiringSoon = DB::connection('central')->table('subscriptions')
            ->join('tenants', 'subscriptions.tenant_id', '=', 'tenants.id')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->where('subscriptions.status', 'active')
            ->whereBetween('subscriptions.current_period_ends_at', [now(), now()->addDays(7)])
            ->select('tenants.name as tenant_name', 'plans.name as plan_name', 'subscriptions.current_period_ends_at')
            ->orderBy('subscriptions.current_period_ends_at', 'asc')
            ->get()
            ->map(fn($item) => [
                'tenant_name' => $item->tenant_name,
                'plan_name'   => $item->plan_name,
                'ends_at'     => Carbon::parse($item->current_period_ends_at)->translatedFormat('d M Y, H:i'),
                'days_left'   => (int) Carbon::parse($item->current_period_ends_at)->diffInDays(now()),
            ]);
    
        // ── BARU: Trial yang akan expired dalam 7 hari (potensi konversi) ───────
        $trialExpiringSoon = DB::connection('central')->table('subscriptions')
            ->join('tenants', 'subscriptions.tenant_id', '=', 'tenants.id')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->where('subscriptions.status', 'trial')
            ->whereBetween('subscriptions.current_period_ends_at', [now(), now()->addDays(7)])
            ->select('tenants.name as tenant_name', 'plans.name as plan_name', 'subscriptions.current_period_ends_at')
            ->orderBy('subscriptions.current_period_ends_at', 'asc')
            ->get()
            ->map(fn($item) => [
                'tenant_name' => $item->tenant_name,
                'plan_name'   => $item->plan_name,
                'ends_at'     => Carbon::parse($item->current_period_ends_at)->translatedFormat('d M Y, H:i'),
                'days_left'   => (int) Carbon::parse($item->current_period_ends_at)->diffInDays(now()),
            ]);
    
        return [
            'summary' => [
                'current_mrr'  => (float) $currentMrr,
                'active_count' => $activeSubsCount,
                'trial_count'  => $trialSubsCount,
            ],
            'charts' => [
                'billing_cycle' => $billingCycle, // ← BARU
            ],
            'tables' => [
                'expiring_soon'       => $expiringSoon,
                'trial_expiring_soon' => $trialExpiringSoon, // ← BARU
            ],
        ];
    }

    // ============================================================================
    // DATA EXPORT (CSV)
    // ============================================================================
    
    public function getFinanceExportData(Carbon $start, Carbon $end)
    {
        return DB::connection('central')->table('payments')
            ->join('tenants', 'payments.tenant_id', '=', 'tenants.id')
            ->where('payments.status', 'success')
            ->whereBetween('payments.paid_at', [$start, $end])
            ->select('payments.order_id', 'tenants.name as tenant_name', 'payments.payment_type', 'payments.gross_amount', 'payments.paid_at')
            ->orderBy('payments.paid_at', 'desc')
            ->get();
    }

    public function getGrowthExportData(Carbon $start, Carbon $end)
    {
        return DB::connection('central')->table('tenants')
            ->whereBetween('created_at', [$start, $end])
            ->select('name', 'slug', 'owner_name', 'owner_email', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getSubscriptionExportData()
    {
        return DB::connection('central')->table('subscriptions')
            ->join('tenants', 'subscriptions.tenant_id', '=', 'tenants.id')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->select('tenants.name as tenant_name', 'plans.name as plan_name', 'subscriptions.status', 'subscriptions.billing_cycle', 'subscriptions.current_period_ends_at')
            ->orderBy('subscriptions.current_period_ends_at', 'asc')
            ->get();
    }
}