<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreClassPlanRequest;
use App\Http\Requests\Tenant\UpdateClassPlanRequest;
use App\Http\Resources\Tenant\ClassPlanResource;
use App\Http\Resources\Tenant\MembershipPlanResource;
use App\Models\Tenant\ClassPlan;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;

class ClassPlanController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->header('X-Branch-Id');

        $query = ClassPlan::query();

        if ($branchId) {
            $query->forBranch($branchId);
        }

        if ($request->filled('category'))       $query->where('category', $request->category);
        if ($request->filled('is_active'))       $query->where('is_active', $request->boolean('is_active'));
        if ($request->filled('access_type'))     $query->where('access_type', $request->access_type);
        if ($request->boolean('available_only')) $query->available();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%");
            });
        }

        $plans = $query->orderBy('sort_order')->orderBy('name')
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success(ClassPlanResource::collection($plans)->response()->getData(true));
    }

    public function store(StoreClassPlanRequest $request)
    {
        $data = $request->validated();

        if (empty($data['branch_id'])) {
            $data['branch_id'] = $request->header('X-Branch-Id') ?? null;
        }

        if (!empty($data['unlimited_monthly_session'])) $data['monthly_quota'] = null;
        if (!empty($data['unlimited_daily_session']))   $data['daily_quota']   = null;
        if (!empty($data['always_available']))        { $data['available_from'] = null; $data['available_until'] = null; }

        $membershipPlanIds = $data['membership_plan_ids'] ?? [];
        unset($data['membership_plan_ids']);

        $plan = ClassPlan::create($data);

        // Attach ke membership plans jika ada
        if (!empty($membershipPlanIds)) {
            $plan->membershipPlans()->sync($membershipPlanIds);
        }

        $plan->load('branch');

        return ApiResponse::success(new ClassPlanResource($plan), 'Class plan created successfully', 201);
    }

    public function show(string $id)
    {
        $plan = ClassPlan::with('branch', 'membershipPlans')->findOrFail($id);
        return ApiResponse::success(new ClassPlanResource($plan));
    }

    public function update(UpdateClassPlanRequest $request, string $id)
    {
        $plan = ClassPlan::findOrFail($id);
        $data = $request->validated();

        if (isset($data['unlimited_monthly_session']) && $data['unlimited_monthly_session']) $data['monthly_quota'] = null;
        if (isset($data['unlimited_daily_session'])   && $data['unlimited_daily_session'])   $data['daily_quota']   = null;
        if (isset($data['always_available'])          && $data['always_available'])         { $data['available_from'] = null; $data['available_until'] = null; }

        $plan->update($data);
        $plan->load('branch');

        return ApiResponse::success(new ClassPlanResource($plan), 'Class plan updated successfully');
    }

    public function destroy(string $id)
    {
        $plan = ClassPlan::findOrFail($id);

        // Detach dari semua membership plans sebelum delete
        $plan->membershipPlans()->detach();
        $plan->delete();

        return ApiResponse::success(null, 'Class plan deleted successfully');
    }

    public function toggleActive(string $id)
    {
        $plan = ClassPlan::findOrFail($id);
        $plan->update(['is_active' => !$plan->is_active]);

        return ApiResponse::success(
            new ClassPlanResource($plan),
            'Class plan ' . ($plan->is_active ? 'activated' : 'deactivated')
        );
    }

    public function duplicate(string $id)
    {
        $original  = ClassPlan::with('membershipPlans')->findOrFail($id);
        $duplicate = $original->replicate();
        $duplicate->name       = $original->name . ' (Copy)';
        $duplicate->is_active  = false;
        $duplicate->sort_order = $original->sort_order + 1;
        $duplicate->save();

        // Copy relasi ke membership plans
        $duplicate->membershipPlans()->sync(
            $original->membershipPlans->pluck('id')->toArray()
        );

        $duplicate->load('branch');

        return ApiResponse::success(new ClassPlanResource($duplicate), 'Class plan duplicated', 201);
    }

    public function categories(Request $request)
    {
        $branchId = $request->header('X-Branch-Id');

        $categories = ClassPlan::query()
            ->when($branchId, fn($q) => $q->forBranch($branchId))
            ->whereNotNull('category')
            ->where('is_active', true)
            ->distinct()->pluck('category')
            ->sort()->values();

        return ApiResponse::success($categories);
    }

    /**
     * Lihat membership plans yang menginclude class plan ini
     */
    public function membershipPlans(string $id)
    {
        $plan = ClassPlan::with('membershipPlans')->findOrFail($id);
        return ApiResponse::success(MembershipPlanResource::collection($plan->membershipPlans));
    }
}