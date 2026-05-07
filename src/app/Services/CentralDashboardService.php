<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CentralDashboardService
{
    /**
     * Mengambil semua data untuk Dashboard Central SaaS
     */
    public function getDashboardData(): array
    {
        return [
            'summary'           => $this->getSummaryMetrics(),
            'revenue_chart'     => $this->getRevenueChart(6),
            'recent_tenants'    => $this->getRecentTenants(),
            'recent_payments'   => $this->getRecentPayments(),
        ];
    }

    private function getSummaryMetrics(): array
    {
        $now = now();

        // 1. Total Active Tenants (termasuk yang lagi trial)
        $activeTenants = DB::connection('central')->table('tenants')
            ->whereIn('status', ['active', 'trial'])
            ->count();

        // 2. New Tenants This Month
        $newTenants = DB::connection('central')->table('tenants')
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->count();

        // 3. Revenue This Month (Total uang masuk bulan ini)
        $revenueThisMonth = DB::connection('central')->table('payments')
            ->where('status', 'success')
            ->whereYear('paid_at', $now->year)
            ->whereMonth('paid_at', $now->month)
            ->sum('gross_amount');

        // 4. Hitung MRR (Monthly Recurring Revenue)
        // Estimasi kasar: Jumlahkan nilai paket langganan bulanan yang aktif
        // (Jika ada tahunan, idealnya dibagi 12. Di sini kita hitung semua langganan aktif)
        $mrrMonthly = DB::connection('central')->table('subscriptions')
            ->where('status', 'active')
            ->where('billing_cycle', 'monthly')
            ->sum('amount');

        $mrrYearly = DB::connection('central')->table('subscriptions')
            ->where('status', 'active')
            ->where('billing_cycle', 'yearly')
            ->sum('amount');
            
        // MRR = Total Bulanan + (Total Tahunan / 12)
        $mrr = $mrrMonthly + ($mrrYearly / 12);

        return [
            'active_tenants'         => $activeTenants,
            'new_tenants_this_month' => $newTenants,
            'revenue_this_month'     => (float) $revenueThisMonth,
            'mrr'                    => (float) $mrr,
        ];
    }

    private function getRevenueChart(int $monthsAgo): array
    {
        $chartData = [];

        // Looping mundur untuk mendapatkan data per bulan
        // Misal sekarang April 2026, akan mundur sampai Nov 2025
        for ($i = $monthsAgo - 1; $i >= 0; $i--) {
            $targetMonth = now()->subMonthsNoOverflow($i);
            
            $totalRevenue = DB::connection('central')->table('payments')
                ->where('status', 'success')
                ->whereYear('paid_at', $targetMonth->year)
                ->whereMonth('paid_at', $targetMonth->month)
                ->sum('gross_amount');

            $chartData[] = [
                'month'   => $targetMonth->translatedFormat('M Y'), // cth: "Apr 2026"
                'revenue' => (float) $totalRevenue
            ];
        }

        return $chartData;
    }

    private function getRecentTenants(): array
    {
        return DB::connection('central')->table('tenants')
            ->select('id', 'name', 'slug', 'owner_name', 'status', 'created_at')
            ->latest('created_at')
            ->take(5)
            ->get()
            ->toArray();
    }

    private function getRecentPayments(): array
    {
        return DB::connection('central')->table('payments')
            ->join('tenants', 'payments.tenant_id', '=', 'tenants.id')
            ->select(
                'payments.id', 
                'payments.order_id', 
                'payments.gross_amount', 
                'payments.payment_type', 
                'payments.paid_at', 
                'tenants.name as tenant_name'
            )
            ->where('payments.status', 'success')
            ->latest('payments.paid_at')
            ->take(5)
            ->get()
            ->toArray();
    }
}