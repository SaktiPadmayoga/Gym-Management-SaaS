<?php
// app/Http/Controllers/PlanController.php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Http\Requests\StorePlanRequest;
use App\Http\Requests\UpdatePlanRequest;
use App\Http\Resources\PlanResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PlanController extends Controller
{
    /**
     * GET /api/plans
     * List all plans dengan pagination & filtering
     */
    public function index(Request $request)
    {
        
        try {
            $query = Plan::query();

            // ✅ Search - Case Insensitive
            $keyword = $request->input('search') ?? $request->input('keyword');

            if ($keyword) {
                $search = trim($keyword);
                $query->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(name) LIKE ?', ["%".strtolower($search)."%"])
                      ->orWhereRaw('LOWER(code) LIKE ?', ["%".strtolower($search)."%"]);
                });
            }

            // Filtering
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('is_public')) {
                $query->where('is_public', $request->boolean('is_public'));
            }

            // Sorting
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = min($request->input('per_page', 15), 100);
            $page = $request->input('page', 1);
            
            $plans = $query->paginate($perPage, ['*'], 'page', $page);

         

            // ✅ STANDARDIZED RESPONSE
            return ApiResponse::success(
                PlanResource::collection($plans->items()),
                'Plans retrieved successfully',
                [
                    $plans->total(),
                    $plans->perPage(),
                    $plans->currentPage(),
                    $plans->lastPage()
                ]
            );

        

        } catch (\Exception $e) {
            Log::error('Error fetching plans: ' . $e->getMessage());
            return ApiResponse::error(
                'Failed to fetch plans',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

    /**
     * POST /api/plans
     * Create new plan
     */
    public function store(StorePlanRequest $request)
    {
        try {
            $validated = $request->validated();

            // Handle features as JSON
            if (isset($validated['features']) && is_array($validated['features'])) {
                $validated['features'] = json_encode($validated['features']);
            }

            $plan = Plan::create($validated);

            Log::info('Plan created', ['plan_id' => $plan->id]); //'user_id' => auth()->id()]

            // ✅ STANDARDIZED RESPONSE
            return ApiResponse::success(
                new PlanResource($plan),
                'Plan created successfully',
                null,
                201
            );

        } catch (\Exception $e) {
            Log::error('Error creating plan: ' . $e->getMessage());
            return ApiResponse::error(
                'Failed to create plan',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

    /**
     * GET /api/plans/{id}
     * Get single plan
     */
    public function show($id)
{
    try {
        $plan = Plan::find($id);

        if (!$plan) {
            return ApiResponse::error('Plan not found', null, 404);
        }

        return ApiResponse::success(
            new PlanResource($plan),
            'Plan retrieved successfully'
        );

    } catch (\Exception $e) {
        Log::error('Error fetching plan: ' . $e->getMessage());
        return ApiResponse::error(
            'Failed to fetch plan',
            config('app.debug') ? $e->getMessage() : null,
            500
        );
    }
}

    /**
     * PUT/PATCH /api/plans/{id}
     * Update plan
     */
    public function update(UpdatePlanRequest $request, $id)
{
    try {
        $plan = Plan::find($id);

        if (!$plan) {
            return ApiResponse::error('Plan not found', null, 404);
        }

        $validated = $request->validated();

        if (isset($validated['features']) && is_array($validated['features'])) {
            $validated['features'] = json_encode($validated['features']);
        }

        $plan->update($validated);

        Log::info('Plan updated', ['plan_id' => $plan->id]);

        return ApiResponse::success(
            new PlanResource($plan),
            'Plan updated successfully'
        );

    } catch (\Exception $e) {
        Log::error('Error updating plan: ' . $e->getMessage());
        return ApiResponse::error(
            'Failed to update plan',
            config('app.debug') ? $e->getMessage() : null,
            500
        );
    }
}

  /**
     * DELETE /api/plans/{id}
     * Delete plan (soft delete)
     */

public function destroy($id)
{
    try {
        $plan = Plan::find($id);

        if (!$plan) {
            return ApiResponse::error('Plan not found', null, 404);
        }

        $plan->delete();

        Log::info('Plan deleted', ['plan_id' => $id]);

        return ApiResponse::success(
            null,
            'Plan deleted successfully',
            null,
            200
        );

    } catch (\Exception $e) {
        Log::error('Error deleting plan: ' . $e->getMessage());
        return ApiResponse::error(
            'Failed to delete plan',
            config('app.debug') ? $e->getMessage() : null,
            500
        );
    }
}

  

    /**
     * POST /api/plans/{id}/restore
     * Restore soft deleted plan
     */
    public function restore($id)
    {
        try {
            $plan = Plan::withTrashed()->findOrFail($id);
            $plan->restore();

            Log::info('Plan restored', ['plan_id' => $id]); //'user_id' => auth()->id()

            // ✅ STANDARDIZED RESPONSE
            return ApiResponse::success(
                new PlanResource($plan),
                'Plan restored successfully'
            );

        } catch (\Exception $e) {
            Log::error('Error restoring plan: ' . $e->getMessage());
            return ApiResponse::error(
                'Failed to restore plan',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

    /**
     * DELETE /api/plans/{id}/force
     * Force delete plan (permanent)
     */
    public function forceDelete($id)
    {
        try {
            $plan = Plan::withTrashed()->findOrFail($id);
            $plan->forceDelete();

            Log::info('Plan force deleted', ['plan_id' => $id]); //'user_id' => auth()->id()

            // ✅ STANDARDIZED RESPONSE
            return ApiResponse::success(
                null,
                'Plan permanently deleted',
                null,
                200
            );

        } catch (\Exception $e) {
            Log::error('Error force deleting plan: ' . $e->getMessage());
            return ApiResponse::error(
                'Failed to permanently delete plan',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }
}