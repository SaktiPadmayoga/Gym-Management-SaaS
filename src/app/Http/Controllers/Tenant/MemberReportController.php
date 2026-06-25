<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\MemberReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MemberReportController extends Controller
{
    public function __construct(
        protected MemberReportService $reportService
    ) {}

    public function summary(Request $request)
    {
        try {
            $member = $request->user('member');

            $data = $this->reportService->getSummary(
                $member->id,
                $request->start_date,
                $request->end_date,
            );

            return ApiResponse::success($data, 'Member report retrieved successfully');

        } catch (\Exception $e) {
            Log::error('[MemberReport] Error fetching report', [
                'error'     => $e->getMessage(),
                'member_id' => $request->user('member')?->id,
            ]);

            return ApiResponse::error(
                'Failed to fetch report data',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }
}
