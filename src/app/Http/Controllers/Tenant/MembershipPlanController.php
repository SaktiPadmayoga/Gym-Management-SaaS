<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreMembershipPlanRequest;
use App\Http\Requests\Tenant\UpdateMembershipPlanRequest;
use App\Http\Resources\Tenant\ClassPlanResource;
use App\Http\Resources\Tenant\MembershipPlanResource;
use App\Models\Tenant\MembershipPlan;
use App\Models\Tenant\ClassPlan;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;

class MembershipPlanController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->header('X-Branch-Id');

        $query = MembershipPlan::query()->with('classPlans');

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

        $plans = $query->orderBy('sort_order')->orderBy('price')
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success(MembershipPlanResource::collection($plans)->response()->getData(true));
    }

    public function store(StoreMembershipPlanRequest $request)
    {
        $data = $request->validated();

        if (empty($data['branch_id'])) {
            $data['branch_id'] = $request->header('X-Branch-Id') ?? null;
        }

        if (!empty($data['unlimited_checkin']))  $data['checkin_quota_per_month'] = null;
        if (!empty($data['unlimited_sold']))      $data['total_quota']             = null;
        if (!empty($data['always_available']))  { $data['available_from'] = null; $data['available_until'] = null; }

        $classPlanIds = $data['class_plan_ids'] ?? [];
        unset($data['class_plan_ids']);

        $plan = MembershipPlan::create($data);

        // Attach class plans jika ada
        if (!empty($classPlanIds)) {
            $plan->classPlans()->sync($classPlanIds);
        }

        $plan->load('branch', 'classPlans');

        return ApiResponse::success(new MembershipPlanResource($plan), 'Membership plan created successfully', 201);
    }

    public function show(string $id)
    {
        $plan = MembershipPlan::with('branch', 'classPlans')->findOrFail($id);
        return ApiResponse::success(new MembershipPlanResource($plan));
    }

    public function update(UpdateMembershipPlanRequest $request, string $id)
    {
        $plan = MembershipPlan::findOrFail($id);
        $data = $request->validated();


        if (isset($data['unlimited_checkin']) && $data['unlimited_checkin'])   $data['checkin_quota_per_month'] = null;
        if (isset($data['unlimited_sold'])    && $data['unlimited_sold'])       $data['total_quota']             = null;
        if (isset($data['always_available'])  && $data['always_available'])   { $data['available_from'] = null; $data['available_until'] = null; }

        $plan->update($data);
        $plan->load('branch', 'classPlans');

        return ApiResponse::success(new MembershipPlanResource($plan), 'Membership plan updated successfully');
    }

    public function destroy(string $id)
    {
        $plan = MembershipPlan::findOrFail($id);

        $activeMemberCount = $plan->memberships()->where('status', 'active')->count();
        if ($activeMemberCount > 0) {
            return ApiResponse::error(
                "Cannot delete plan with {$activeMemberCount} active member(s). Deactivate instead.",
                null, 422
            );
        }

        $plan->classPlans()->detach();
        $plan->delete();

        return ApiResponse::success(null, 'Membership plan deleted successfully');
    }

    public function toggleActive(string $id)
    {
        $plan = MembershipPlan::findOrFail($id);
        $plan->update(['is_active' => !$plan->is_active]);

        return ApiResponse::success(
            new MembershipPlanResource($plan),
            'Plan ' . ($plan->is_active ? 'activated' : 'deactivated')
        );
    }

    public function duplicate(string $id)
    {
        $original  = MembershipPlan::with('classPlans')->findOrFail($id);
        $duplicate = $original->replicate();
        $duplicate->name       = $original->name . ' (Copy)';
        $duplicate->is_active  = false;
        $duplicate->sort_order = $original->sort_order + 1;
        $duplicate->save();

        // Copy class plan inclusions
        $pivotData = $original->classPlans->mapWithKeys(fn($cp) => [
            $cp->id => [
                'unlimited_session'       => $cp->pivot->unlimited_session,
                'monthly_quota_override'  => $cp->pivot->monthly_quota_override,
                'daily_quota_override'    => $cp->pivot->daily_quota_override,
            ]
        ])->toArray();

        $duplicate->classPlans()->sync($pivotData);
        $duplicate->load('branch', 'classPlans');

        return ApiResponse::success(new MembershipPlanResource($duplicate), 'Plan duplicated', 201);
    }

    public function categories(Request $request)
    {
        $branchId = $request->header('X-Branch-Id');

        $categories = MembershipPlan::query()
            ->when($branchId, fn($q) => $q->forBranch($branchId))
            ->where('is_active', true)
            ->distinct()->pluck('category')
            ->sort()->values();

        return ApiResponse::success($categories);
    }

    // =============================================
    // Class Plan Inclusions
    // =============================================

    /**
     * Lihat class plans yang termasuk dalam membership plan ini
     */
    public function classPlans(string $id)
    {
        $plan = MembershipPlan::with('classPlans')->findOrFail($id);
        return ApiResponse::success(ClassPlanResource::collection($plan->classPlans));
    }

    /**
     * Sync class plans ke membership plan
     * Kirim array of class_plan_id, akan replace semua yang ada
     */
    public function syncClassPlans(Request $request, string $id)
    {
        $request->validate([
            'class_plan_ids'   => ['required', 'array'],
            'class_plan_ids.*' => ['uuid'],
        ]);

        $plan = MembershipPlan::findOrFail($id);
        $plan->classPlans()->sync($request->class_plan_ids);
        $plan->load('classPlans');

        return ApiResponse::success(
            ClassPlanResource::collection($plan->classPlans),
            'Class plans synced successfully'
        );
    }

    /**
     * Attach satu class plan dengan optional quota override
     */
    public function attachClassPlan(Request $request, string $id)
    {
        $request->validate([
            'class_plan_id'          => ['required', 'uuid'],
            'unlimited_session'      => ['nullable', 'boolean'],
            'monthly_quota_override' => ['nullable', 'integer', 'min:1'],
            'daily_quota_override'   => ['nullable', 'integer', 'min:1'],
        ]);

        $plan = MembershipPlan::findOrFail($id);

        $plan->classPlans()->syncWithoutDetaching([
            $request->class_plan_id => [
                'unlimited_session'       => $request->unlimited_session,
                'monthly_quota_override'  => $request->monthly_quota_override,
                'daily_quota_override'    => $request->daily_quota_override,
            ]
        ]);

        $plan->load('classPlans');

        return ApiResponse::success(
            ClassPlanResource::collection($plan->classPlans),
            'Class plan attached successfully'
        );
    }

    /**
     * Detach satu class plan dari membership plan
     */
    public function detachClassPlan(string $id, string $classPlanId)
    {
        $plan = MembershipPlan::findOrFail($id);
        $plan->classPlans()->detach($classPlanId);

        return ApiResponse::success(null, 'Class plan detached successfully');
    }
    
   public function getAvailablePlans(Request $request)
    {
        // 1. Validasi input, tambahkan 'is_active' yang sebelumnya terlewat
        $request->validate([
            'category'       => ['nullable', 'string'],
            'access_type'    => ['nullable', 'string'],
            'available_only' => ['nullable', 'boolean'],
            'is_active'      => ['nullable', 'boolean'], // <-- Ditambahkan
            'search'         => ['nullable', 'string'],
            'per_page'       => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $branchId = $request->header('X-Branch-Id');

        $query = MembershipPlan::query()->with('classPlans');

        if ($branchId) {
            $query->forBranch($branchId);
        }

        // 2. Filter String menggunakan filled()
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->filled('access_type')) {
            $query->where('access_type', $request->access_type);
        }

        // 3. Filter Boolean WAJIB menggunakan has() bukan filled()
        // Karena filled() menganggap string "0" atau false sebagai kosong
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        
        // Asumsi ->available() adalah scope di model (misal: mengecek tanggal dan kuota)
        if ($request->boolean('available_only')) {
            $query->available(); 
        }

        // 4. Filter Pencarian (Search)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // 5. Eksekusi Query dan Pagination
        $plans = $query->orderBy('sort_order')
                       ->orderBy('price')
                       ->paginate($request->get('per_page', 15));

        // 6. Return Response yang bersih
        // Memisahkan response Resource Pagination agar bentuk datanya rapi 
        // saat diterima ApiResponse::success()
        $resource = MembershipPlanResource::collection($plans)->response()->getData(true);

        return ApiResponse::success(
            $resource['data'],
            'Available plans retrieved successfully',
            $resource['meta'] // Mengirim link/meta pagination ke parameter tambahan (jika ApiResponse support)
        );
    }   
    
}