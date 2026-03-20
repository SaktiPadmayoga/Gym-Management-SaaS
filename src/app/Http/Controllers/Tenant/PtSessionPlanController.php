<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StorePtSessionPlanRequest;
use App\Http\Requests\Tenant\UpdatePtSessionPlanRequest;
use App\Http\Resources\Tenant\PtSessionPlanResource;
use App\Models\Tenant\PtSessionPlan;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;

class PtSessionPlanController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->header('X-Branch-Id');

        $query = PtSessionPlan::query();

        if ($branchId) {
            $query->forBranch($branchId);
        }

        if ($request->filled('category'))       $query->where('category', $request->category);
        if ($request->filled('is_active'))       $query->where('is_active', $request->boolean('is_active'));
        if ($request->boolean('available_only')) $query->available();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%");
            });
        }

        $plans = $query->orderBy('sort_order')->orderBy('price')
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success(PtSessionPlanResource::collection($plans)->response()->getData(true));
    }

    public function store(StorePtSessionPlanRequest $request)
    {
        $data = $request->validated();

        if (empty($data['branch_id'])) {
            $data['branch_id'] = $request->header('X-Branch-Id') ?? null;
        }

        if (!empty($data['unlimited_sold'])) $data['total_quota'] = null;
        if (!empty($data['always_available'])) {
            $data['available_from']  = null;
            $data['available_until'] = null;
        }

        $plan = PtSessionPlan::create($data);

        return ApiResponse::success(new PtSessionPlanResource($plan), 'PT session plan created successfully', 201);
    }

    public function show(string $id)
    {
        $plan = PtSessionPlan::with('branch')->findOrFail($id);
        return ApiResponse::success(new PtSessionPlanResource($plan));
    }

    public function update(UpdatePtSessionPlanRequest $request, string $id)
    {
        $plan = PtSessionPlan::findOrFail($id);
        $data = $request->validated();

        if (isset($data['unlimited_sold']) && $data['unlimited_sold']) $data['total_quota'] = null;
        if (isset($data['always_available']) && $data['always_available']) {
            $data['available_from']  = null;
            $data['available_until'] = null;
        }

        $plan->update($data);

        return ApiResponse::success(new PtSessionPlanResource($plan->fresh('branch')), 'PT session plan updated successfully');
    }

    public function destroy(string $id)
    {
        $plan = PtSessionPlan::findOrFail($id);

        // TODO: tambahkan guard jika sudah ada transaksi PT aktif
        $plan->delete();

        return ApiResponse::success(null, 'PT session plan deleted successfully');
    }

    public function toggleActive(string $id)
    {
        $plan = PtSessionPlan::findOrFail($id);
        $plan->update(['is_active' => !$plan->is_active]);

        return ApiResponse::success(
            new PtSessionPlanResource($plan),
            'Plan ' . ($plan->is_active ? 'activated' : 'deactivated')
        );
    }

    public function duplicate(string $id)
    {
        $original  = PtSessionPlan::findOrFail($id);
        $duplicate = $original->replicate();
        $duplicate->name       = $original->name . ' (Copy)';
        $duplicate->is_active  = false;
        $duplicate->sort_order = $original->sort_order + 1;
        $duplicate->save();

        return ApiResponse::success(new PtSessionPlanResource($duplicate), 'PT session plan duplicated', 201);
    }

    public function categories(Request $request)
    {
        $branchId = $request->header('X-Branch-Id');

        $categories = PtSessionPlan::query()
            ->when($branchId, fn($q) => $q->forBranch($branchId))
            ->where('is_active', true)
            ->distinct()->pluck('category')
            ->sort()->values();

        return ApiResponse::success($categories);
    }
}