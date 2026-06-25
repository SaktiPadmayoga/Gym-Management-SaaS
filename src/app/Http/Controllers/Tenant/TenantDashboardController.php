<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\TenantDashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TenantDashboardController extends Controller
{
    public function __construct(
        protected TenantDashboardService $dashboardService
    ) {}


    public function getSummary(Request $request)
    {
        try {
            $branchId = $request->header('X-Branch-Id');

            $data = $this->dashboardService->getDashboardData($branchId);

            return ApiResponse::success($data, 'Dashboard data retrieved successfully');

        } catch (\Exception $e) {
            Log::error('[TenantDashboard] Error fetching summary', [
                'error'     => $e->getMessage(),
                'branch_id' => $request->header('X-Branch-Id'),
            ]);

            return ApiResponse::error(
                'Failed to fetch dashboard data',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }
}
