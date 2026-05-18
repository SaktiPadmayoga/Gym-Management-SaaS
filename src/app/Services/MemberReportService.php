<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MemberReportService
{
    /**
     * Mengambil ringkasan laporan aktivitas member.
     */
    public function getSummary(string $memberId, ?string $startDate = null, ?string $endDate = null): array
    {
        $start = $startDate ? Carbon::parse($startDate) : now()->subMonths(6)->startOfMonth();
        $end   = $endDate   ? Carbon::parse($endDate)   : now();

        return [
            'checkin_trend'      => $this->getCheckinTrend($memberId),
            'class_summary'      => $this->getClassSummary($memberId, $start, $end),
            'spending_summary'   => $this->getSpendingSummary($memberId, $start, $end),
            'checkin_stats'      => $this->getCheckinStats($memberId, $start, $end),
        ];
    }

    /**
     * Check-in trend per bulan (6 bulan terakhir)
     */
    private function getCheckinTrend(string $memberId): array
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonthsNoOverflow($i);
            $count = DB::table('check_ins')
                ->where('member_id', $memberId)
                ->where('status', 'success')
                ->whereYear('checked_in_at', $month->year)
                ->whereMonth('checked_in_at', $month->month)
                ->count();

            $data[] = [
                'month' => $month->translatedFormat('M Y'),
                'count' => $count,
            ];
        }
        return $data;
    }

    /**
     * Class attendance summary in given period
     */
    private function getClassSummary(string $memberId, Carbon $start, Carbon $end): array
    {
        $stats = DB::table('class_attendances')
            ->where('member_id', $memberId)
            ->whereBetween('created_at', [$start->startOfDay(), $end->endOfDay()])
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) as attended,
                SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_show
            ")
            ->first();

        return [
            'total'     => (int) ($stats->total ?? 0),
            'attended'  => (int) ($stats->attended ?? 0),
            'booked'    => (int) ($stats->booked ?? 0),
            'cancelled' => (int) ($stats->cancelled ?? 0),
            'no_show'   => (int) ($stats->no_show ?? 0),
        ];
    }

    /**
     * Spending summary (dari tenant_invoices milik member)
     */
    private function getSpendingSummary(string $memberId, Carbon $start, Carbon $end): array
    {
        $invoices = DB::table('tenant_invoices')
            ->where('member_id', $memberId)
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$start->startOfDay(), $end->endOfDay()])
            ->selectRaw("
                COUNT(*) as total_transactions,
                COALESCE(SUM(total_amount), 0) as total_spent
            ")
            ->first();

        // Breakdown by type
        $breakdown = DB::table('tenant_invoices')
            ->join('tenant_invoice_items', 'tenant_invoices.id', '=', 'tenant_invoice_items.tenant_invoice_id')
            ->where('tenant_invoices.member_id', $memberId)
            ->where('tenant_invoices.status', 'paid')
            ->whereBetween('tenant_invoices.paid_at', [$start->startOfDay(), $end->endOfDay()])
            ->selectRaw("
                tenant_invoice_items.item_type,
                COALESCE(SUM(tenant_invoice_items.total_price), 0) as amount
            ")
            ->groupBy('tenant_invoice_items.item_type')
            ->get()
            ->keyBy('item_type')
            ->toArray();

        return [
            'total_transactions' => (int) ($invoices->total_transactions ?? 0),
            'total_spent'        => (float) ($invoices->total_spent ?? 0),
            'breakdown'          => $breakdown,
        ];
    }

    /**
     * Check-in stats within given period
     */
    private function getCheckinStats(string $memberId, Carbon $start, Carbon $end): array
    {
        $total = DB::table('check_ins')
            ->where('member_id', $memberId)
            ->where('status', 'success')
            ->whereBetween('checked_in_at', [$start->startOfDay(), $end->endOfDay()])
            ->count();

        return [
            'total_checkins' => $total,
        ];
    }
}
