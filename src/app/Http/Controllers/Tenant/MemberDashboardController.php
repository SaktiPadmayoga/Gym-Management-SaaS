<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\MemberDashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MemberDashboardController extends Controller
{
    public function __construct(
        protected MemberDashboardService $dashboardService
    ) {}

    public function index(Request $request)
    {
        try {
            $member = $request->user('member');

            $data = $this->dashboardService->getDashboardData($member->id);

            return ApiResponse::success($data, 'Member dashboard data retrieved successfully');

        } catch (\Exception $e) {
            Log::error('[MemberDashboard] Error fetching dashboard', [
                'error'     => $e->getMessage(),
                'member_id' => $request->user('member')?->id,
            ]);

            return ApiResponse::error(
                'Failed to fetch dashboard data',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }
}
