<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\BranchReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BranchReportController extends Controller
{
    public function __construct(protected BranchReportService $reportService)
    {}

    /**
     * GET /api/branch-reports/{type}?start_date=...&end_date=...
     * Branch ID diambil dari header X-Branch-Id
     */
    public function show(Request $request, string $type)
    {
        try {
            $branchId = $request->header('X-Branch-Id');

            if (!$branchId) {
                return ApiResponse::error('Branch context required (X-Branch-Id header)', null, 422);
            }

            $startDate = $request->query('start_date')
                ? Carbon::parse($request->query('start_date'))->startOfDay()
                : now()->startOfMonth();

            $endDate = $request->query('end_date')
                ? Carbon::parse($request->query('end_date'))->endOfDay()
                : now()->endOfMonth();

            $data = match ($type) {
                'daily'          => $this->reportService->getDailyReport($branchId, $request->query('date') ? Carbon::parse($request->query('date')) : now()),
                'member'         => $this->reportService->getMemberReport($branchId, $startDate, $endDate),
                'membership'     => $this->reportService->getMembershipReport($branchId, $startDate, $endDate),
                'checkin-time'   => $this->reportService->getCheckinTimeReport($branchId, $startDate, $endDate),
                'checkin-member' => $this->reportService->getCheckinMemberReport($branchId, $startDate, $endDate),
                'class'          => $this->reportService->getClassReport($branchId, $startDate, $endDate),
                'pt-sessions'    => $this->reportService->getPtSessionReport($branchId, $startDate, $endDate),
                'facility'       => $this->reportService->getFacilityReport($branchId, $startDate, $endDate),
                'finance-sales'  => $this->reportService->getFinanceSalesReport($branchId, $startDate, $endDate),
                'pos'            => $this->reportService->getPosProductReport($branchId, $startDate, $endDate),
                default          => throw new \Exception("Tipe laporan '{$type}' tidak valid.")
            };

            return ApiResponse::success([
                'meta' => [
                    'type'       => $type,
                    'branch_id'  => $branchId,
                    'start_date' => $type === 'daily' ? ($request->query('date') ?? now()->toDateString()) : $startDate->toDateString(),
                    'end_date'   => $type === 'daily' ? ($request->query('date') ?? now()->toDateString()) : $endDate->toDateString(),
                ],
                'data' => $data
            ], "Laporan {$type} berhasil dimuat");

        } catch (\Exception $e) {
            Log::error('[BranchReport] Error', ['type' => $type, 'error' => $e->getMessage()]);
            return ApiResponse::error('Gagal memuat laporan', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }
}
