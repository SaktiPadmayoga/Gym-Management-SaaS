<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\TenantReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TenantReportController extends Controller
{
    public function __construct(protected TenantReportService $reportService)
    {}

    /**
     * GET /api/reports?type=finance&start_date=2026-04-01&end_date=2026-04-30&branch_id=xxx
     */
    public function index(Request $request)
    {
        try {
            $type = $request->query('type', 'finance');
            $branchId = $request->query('branch_id'); // null = semua cabang

            $startDate = $request->query('start_date')
                ? Carbon::parse($request->query('start_date'))->startOfDay()
                : now()->startOfMonth();

            $endDate = $request->query('end_date')
                ? Carbon::parse($request->query('end_date'))->endOfDay()
                : now()->endOfMonth();

            $data = match ($type) {
                'finance'    => $this->reportService->getFinanceReport($startDate, $endDate, $branchId),
                'member'     => $this->reportService->getMemberReport($startDate, $endDate, $branchId),
                'membership' => $this->reportService->getMembershipReport($startDate, $endDate, $branchId),
                default      => throw new \Exception('Tipe laporan tidak valid.')
            };

            return ApiResponse::success([
                'meta' => [
                    'type'       => $type,
                    'start_date' => $startDate->toDateString(),
                    'end_date'   => $endDate->toDateString(),
                    'branch_id'  => $branchId,
                ],
                'data' => $data
            ], "Laporan $type berhasil dimuat");

        } catch (\Exception $e) {
            Log::error('[TenantReport] Error', ['error' => $e->getMessage()]);
            return ApiResponse::error('Gagal memuat laporan', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    /**
     * GET /api/reports/branches — Daftar cabang aktif untuk dropdown filter
     */
    public function branches()
    {
        try {
            $branches = $this->reportService->getActiveBranches();

            return ApiResponse::success($branches, 'Daftar cabang berhasil dimuat');
        } catch (\Exception $e) {
            Log::error('[TenantReport] Error loading branches', ['error' => $e->getMessage()]);
            return ApiResponse::error('Gagal memuat daftar cabang', null, 500);
        }
    }

    /**
     * GET /api/reports/export?type=finance&start_date=...&branch_id=xxx
     */
    public function export(Request $request)
    {
        $type = $request->query('type', 'finance');
        $branchId = $request->query('branch_id');
        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date'))->startOfDay() : now()->startOfMonth();
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date'))->endOfDay() : now()->endOfMonth();

        $fileName = "Gym_Report_{$type}_" . now()->format('Ymd_His') . ".csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        return response()->stream(function () use ($type, $startDate, $endDate, $branchId) {
            $file = fopen('php://output', 'w');

            if ($type === 'finance') {
                fputcsv($file, ['No. Invoice', 'Member', 'Cabang', 'Metode Bayar', 'Total (IDR)', 'Tanggal Lunas']);
                $data = $this->reportService->getFinanceExportData($startDate, $endDate, $branchId);
                foreach ($data as $row) {
                    fputcsv($file, [
                        $row->invoice_number,
                        $row->member_name,
                        $row->branch_name ?? '-',
                        strtoupper($row->payment_method ?? 'OTHER'),
                        $row->total_amount,
                        $row->paid_at
                    ]);
                }
            }
            elseif ($type === 'member') {
                fputcsv($file, ['Nama', 'Email', 'Telepon', 'Status', 'Cabang', 'Tanggal Daftar']);
                $data = $this->reportService->getMemberExportData($startDate, $endDate, $branchId);
                foreach ($data as $row) {
                    fputcsv($file, [
                        $row->name,
                        $row->email ?? '-',
                        $row->phone ?? '-',
                        $row->status,
                        $row->branch_name ?? '-',
                        $row->created_at
                    ]);
                }
            }
            elseif ($type === 'membership') {
                fputcsv($file, ['Member', 'Paket', 'Cabang', 'Status', 'Mulai', 'Berakhir']);
                $data = $this->reportService->getMembershipExportData($branchId);
                foreach ($data as $row) {
                    fputcsv($file, [
                        $row->member_name,
                        $row->plan_name,
                        $row->branch_name ?? '-',
                        $row->status,
                        $row->start_date,
                        $row->end_date ?? 'Lifetime'
                    ]);
                }
            }

            fclose($file);
        }, 200, $headers);
    }
}
