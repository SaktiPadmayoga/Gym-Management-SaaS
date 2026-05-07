<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\CentralDashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CentralDashboardController extends Controller
{
    public function __construct(
        protected CentralDashboardService $dashboardService
    ) {}

    /**
     * GET /api/central/dashboard/summary
     */
    public function getSummary(Request $request)
    {
        try {
            // Jika ada pengecekan role superadmin, letakkan di middleware route
            
            $data = $this->dashboardService->getDashboardData();

            return ApiResponse::success($data, 'Dashboard data retrieved successfully');
            
        } catch (\Exception $e) {
            Log::error('[CentralDashboard] Error fetching summary', [
                'error' => $e->getMessage()
            ]);
            
            return ApiResponse::error(
                'Failed to fetch dashboard data',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }
}