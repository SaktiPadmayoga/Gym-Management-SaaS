<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\CentralReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CentralReportController extends Controller
{
    public function __construct(protected CentralReportService $reportService)
    {}

    /**
     * GET /api/central/reports?type=finance&start_date=2026-04-01&end_date=2026-04-30
     */
    public function index(Request $request)
    {
        try {
            $type = $request->query('type', 'finance');
            
            // Default ke awal bulan dan akhir bulan ini jika tidak ada parameter
            $startDate = $request->query('start_date') 
                ? Carbon::parse($request->query('start_date'))->startOfDay() 
                : now()->startOfMonth();
                
            $endDate = $request->query('end_date') 
                ? Carbon::parse($request->query('end_date'))->endOfDay() 
                : now()->endOfMonth();

            $data = match ($type) {
                'finance'      => $this->reportService->getFinanceReport($startDate, $endDate),
                'growth'       => $this->reportService->getGrowthReport($startDate, $endDate),
                'subscription' => $this->reportService->getSubscriptionReport($startDate, $endDate),
                default        => throw new \Exception('Tipe laporan tidak valid.')
            };

            return ApiResponse::success([
                'meta' => [
                    'type'       => $type,
                    'start_date' => $startDate->toDateString(),
                    'end_date'   => $endDate->toDateString(),
                ],
                'data' => $data
            ], "Laporan $type berhasil dimuat");

        } catch (\Exception $e) {
            Log::error('[CentralReport] Error', ['error' => $e->getMessage()]);
            return ApiResponse::error('Gagal memuat laporan', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    /**
     * GET /api/central/reports/export?type=finance&start_date=...
     */
    public function export(Request $request)
    {
        $type = $request->query('type', 'finance');
        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date'))->startOfDay() : now()->startOfMonth();
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date'))->endOfDay() : now()->endOfMonth();

        $fileName = "SaaS_Report_{$type}_" . now()->format('Ymd_His') . ".csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        // Pakai StreamedResponse agar RAM server aman saat datanya ribuan baris
        return response()->stream(function () use ($type, $startDate, $endDate) {
            $file = fopen('php://output', 'w');

            if ($type === 'finance') {
                fputcsv($file, ['Order ID', 'Nama Gym', 'Metode Bayar', 'Total (IDR)', 'Tanggal Lunas']);
                $data = $this->reportService->getFinanceExportData($startDate, $endDate);
                foreach ($data as $row) {
                    fputcsv($file, [$row->order_id, $row->tenant_name, strtoupper($row->payment_type ?? 'MIDTRANS'), $row->gross_amount, $row->paid_at]);
                }
            } 
            elseif ($type === 'growth') {
                fputcsv($file, ['Nama Gym', 'Subdomain', 'Owner', 'Email', 'Status', 'Tanggal Daftar']);
                $data = $this->reportService->getGrowthExportData($startDate, $endDate);
                foreach ($data as $row) {
                    fputcsv($file, [$row->name, $row->slug, $row->owner_name, $row->owner_email, $row->status, $row->created_at]);
                }
            } 
            elseif ($type === 'subscription') {
                fputcsv($file, ['Nama Gym', 'Paket', 'Siklus Tagihan', 'Status', 'Jatuh Tempo']);
                $data = $this->reportService->getSubscriptionExportData();
                foreach ($data as $row) {
                    fputcsv($file, [$row->tenant_name, $row->plan_name, ucfirst($row->billing_cycle), $row->status, $row->current_period_ends_at]);
                }
            }

            fclose($file);
        }, 200, $headers);
    }
}