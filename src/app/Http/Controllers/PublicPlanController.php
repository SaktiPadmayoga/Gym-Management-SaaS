<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Http\Resources\PlanResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Support\Facades\Log;

class PublicPlanController extends Controller
{
    public function index()
    {
        try {
            $plans = Plan::where('is_active', true)->where('is_public', true)->orderBy('created_at', 'desc')->get();
            return ApiResponse::success(
                PlanResource::collection($plans),
                'Public plans retrieved successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error fetching public plans: ' . $e->getMessage());
            return ApiResponse::error(
                'Failed to fetch public plans',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }
}
