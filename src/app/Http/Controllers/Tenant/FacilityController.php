<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreFacilityRequest;
use App\Http\Requests\Tenant\UpdateFacilityRequest;
use App\Http\Resources\Tenant\FacilityResource;
use App\Models\Tenant\Facility;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->header('X-Branch-Id');

        $query = Facility::query();

        if ($branchId) {
            $query->forBranch($branchId);
        }

        if ($request->filled('category'))       $query->where('category', $request->category);
        if ($request->filled('access_type'))     $query->where('access_type', $request->access_type);
        if ($request->filled('is_active'))       $query->where('is_active', $request->boolean('is_active'));
        if ($request->boolean('available_only')) $query->available();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%");
            });
        }

        $facilities = $query->orderBy('sort_order')->orderBy('name')
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success(FacilityResource::collection($facilities)->response()->getData(true));
    }

    public function store(StoreFacilityRequest $request)
    {
        $data = $request->validated();

        if (empty($data['branch_id'])) {
            $data['branch_id'] = $request->header('X-Branch-Id') ?? null;
        }

        if (!empty($data['always_available'])) {
            $data['available_from']  = null;
            $data['available_until'] = null;
        }

        $facility = Facility::create($data);

        return ApiResponse::success(new FacilityResource($facility), 'Facility created successfully', 201);
    }

    public function show(string $id)
    {
        $facility = Facility::with('branch')->findOrFail($id);
        return ApiResponse::success(new FacilityResource($facility));
    }

    public function update(UpdateFacilityRequest $request, string $id)
    {
        $facility = Facility::findOrFail($id);
        $data     = $request->validated();

        if (isset($data['always_available']) && $data['always_available']) {
            $data['available_from']  = null;
            $data['available_until'] = null;
        }

        $facility->update($data);

        return ApiResponse::success(new FacilityResource($facility->fresh('branch')), 'Facility updated successfully');
    }

    public function destroy(string $id)
    {
        $facility = Facility::findOrFail($id);
        $facility->delete();

        return ApiResponse::success(null, 'Facility deleted successfully');
    }

    public function toggleActive(string $id)
    {
        $facility = Facility::findOrFail($id);
        $facility->update(['is_active' => !$facility->is_active]);

        return ApiResponse::success(
            new FacilityResource($facility),
            'Facility ' . ($facility->is_active ? 'activated' : 'deactivated')
        );
    }

    public function categories(Request $request)
    {
        $branchId = $request->header('X-Branch-Id');

        $categories = Facility::query()
            ->when($branchId, fn($q) => $q->forBranch($branchId))
            ->whereNotNull('category')
            ->where('is_active', true)
            ->distinct()->pluck('category')
            ->sort()->values();

        return ApiResponse::success($categories);
    }
}