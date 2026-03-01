<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionTenantController extends Controller
{
    public function current(Request $request)
    {
        try {
            $tenant = tenant();

            $subscription = DB::connection('central')
                ->table('subscriptions')
                ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
                ->where('subscriptions.tenant_id', $tenant->id)
                ->where('subscriptions.status', 'active')
                ->select(
                    'subscriptions.id',
                    'subscriptions.status',
                    'subscriptions.billing_cycle',
                    'subscriptions.started_at',
                    'subscriptions.current_period_ends_at',
                    'subscriptions.trial_ends_at',
                    'plans.id as plan_id',
                    'plans.name as plan_name',
                    'plans.code as plan_code',
                    'plans.price_monthly',
                    'plans.price_yearly',
                    'plans.max_branches',
                    'plans.description',
                )
                ->first();

            if (!$subscription) {
                return null;
            }

            return ApiResponse::success($subscription, 'Subscription retrieved successfully');

        } catch (\Exception $e) {
            Log::error('Error fetching current subscription', ['error' => $e->getMessage()]);
            return ApiResponse::error('Failed to fetch subscription', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    public function history(Request $request)
    {
        try {
            $tenant = tenant();

            $history = DB::connection('central')
                ->table('subscriptions')
                ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
                ->where('subscriptions.tenant_id', $tenant->id)
                ->whereIn('subscriptions.status', ['cancelled', 'expired', 'trial'])
                ->select(
                    'subscriptions.id',
                    'subscriptions.status',
                    'subscriptions.billing_cycle',
                    'subscriptions.started_at',
                    'subscriptions.current_period_ends_at',
                    'plans.name as plan_name',
                    'plans.code as plan_code',
                )
                ->orderBy('subscriptions.created_at', 'desc')
                ->get();

            return ApiResponse::success($history, 'Subscription history retrieved successfully');

        } catch (\Exception $e) {
            Log::error('Error fetching subscription history', ['error' => $e->getMessage()]);
            return ApiResponse::error('Failed to fetch subscription history', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }
}