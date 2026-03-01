<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Domain;
use App\Http\Resources\TenantResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreTenantRequest;



class TenantController extends Controller
{
    /**
     * GET /api/tenants
     */
    public function index(Request $request)
    {
        try {
            $query = Tenant::with(['domains', 'latestSubscription.plan']);

            // Search
            if ($request->filled('search')) {
                $search = strtolower(trim($request->search));
                $query->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(owner_name) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(owner_email) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('CAST(id AS TEXT) LIKE ?', ["%{$search}%"]);
                });
            }

            // Filter status
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Sorting
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = strtoupper($request->input('sort_order', 'DESC')) === 'ASC' ? 'ASC' : 'DESC';

            $allowedSorts = ['name','status','created_at','trial_ends_at','subscription_ends_at'];

            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'DESC');
            }

            $perPage = min((int)$request->input('per_page', 15), 100);
            $tenants = $query->paginate($perPage);

            return ApiResponse::success(
                TenantResource::collection($tenants),
                'Tenants retrieved successfully',
                [
                    'total' => $tenants->total(),
                    'per_page' => $tenants->perPage(),
                    'current_page' => $tenants->currentPage(),
                    'last_page' => $tenants->lastPage(),
                ]
            );

        } catch (\Exception $e) {
            Log::error('Error fetching tenants', ['error' => $e->getMessage()]);

            return ApiResponse::error(
                'Failed to fetch tenants',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

    /**
     * POST /api/tenants
     */
    

    public function store(StoreTenantRequest $request)
{
    $validated = $request->validated();

    $slug = Str::slug($validated['slug']);

    // =====================
    // CREATE TENANT (DI CENTRAL DATABASE)
    // =====================
    $tenant = Tenant::create([
        'id' => (string) Str::uuid(),
        'name' => $validated['name'],
        'slug' => $slug,
        'owner_name' => $validated['owner_name'],
        'owner_email' => $validated['owner_email'],
        'status' => $validated['status'],
        'logo_url' => $validated['logo_url'] ?? null,
        'timezone' => $validated['timezone'],
        'locale' => $validated['locale'],
        'max_branches' => 1,
        'current_branch_count' => 1,
        'trial_ends_at' => $validated['trial_ends_at'] ?? now()->addDays(14),
        'subscription_ends_at' => $validated['subscription_ends_at'] ?? now()->addDays(14),
 0   ]);

    // =====================
    // CREATE TENANT DOMAIN (DI CENTRAL DATABASE)
    // =====================
    $tenant->domains()->create([
        'id' => (string) Str::uuid(),
        'domain' => "{$slug}.localhost",
        'type' => 'tenant',
        'is_primary' => true,
    ]);

    // =====================
    // CREATE BRANCH DI TENANT DATABASE
    // Menggunakan tenancy()->run() untuk menjalankan closure di context tenant
    // =====================
    $branchData = $validated['branch'];
    $branchId = (string) Str::uuid();
    $branchSlug = Str::slug($branchData['branch_code']);

    $tenant->run(function () use ($branchData, $branchId, $validated) {
        // Ini berjalan di tenant database context
        \App\Models\Branch::create([
            'id' => $branchId,
            'branch_code' => $branchData['branch_code'],
            'name' => $branchData['name'],
            'address' => $branchData['address'] ?? null,
            'city' => $branchData['city'] ?? null,
            'phone' => $branchData['phone'] ?? null,
            'email' => $branchData['email'] ?? null,
            'timezone' => $branchData['timezone'] ?? $validated['timezone'],
            'is_active' => true,
            'opened_at' => $branchData['opened_at'] ?? now(),
        ]);
    });

    // =====================
    // CREATE BRANCH DOMAIN (DI CENTRAL DATABASE)
    // =====================
    Domain::create([
        'id' => (string) Str::uuid(),
        'tenant_id' => $tenant->id,
        'branch_id' => $branchId,
        'domain' => "{$branchSlug}.{$slug}.localhost",
        'type' => 'branch',
        'is_primary' => true,
    ]);

    return ApiResponse::success(
        new TenantResource($tenant->load(['domains'])),
        'Tenant created successfully',
        null,
        201
    );
}



    /**
     * GET /api/tenants/{id}
     */
    public function show(Tenant $tenant)
    {
        return ApiResponse::success(
            new TenantResource($tenant->load(['domains', 'latestSubscription.plan'])),
            'Tenant retrieved successfully'
        );
    }

    /**
     * PUT /api/tenants/{id}
     */
    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name'        => 'sometimes|string',
            'slug'        => 'sometimes|string|unique:tenants,slug,' . $tenant->id,
            'owner_name'  => 'sometimes|string',
            'owner_email' => 'sometimes|email',
            'status'      => 'sometimes|in:trial,active,suspended,expired',
            'logo_url'    => 'nullable|string',
            'timezone'    => 'sometimes|string',
            'locale'      => 'sometimes|string',
            'data'        => 'nullable|array',
            'trial_ends_at' => 'nullable|date',
            'subscription_ends_at' => 'nullable|date',
        ]);

        if (isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $tenant->update($validated);

        return ApiResponse::success(
            new TenantResource($tenant->fresh(['domains'])),
            'Tenant updated successfully'
        );
    }

    /**
     * DELETE /api/tenants/{id}
     */
    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return ApiResponse::success(
            null,
            'Tenant deleted successfully'
        );
    }

    /**
     * POST /api/tenants/{id}/restore
     */
    public function restore($id)
    {
        $tenant = Tenant::withTrashed()->findOrFail($id);
        $tenant->restore();

        return ApiResponse::success(
            new TenantResource($tenant->load(['domains'])),
            'Tenant restored successfully'
        );
    }

    /**
     * GET /api/tenants/current
     */
    public function current()
    {
        $tenant = tenant();

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        return ApiResponse::success(
            new TenantResource($tenant->load(['domains','branches'])),
            'Current tenant retrieved'
        );
    }
}
