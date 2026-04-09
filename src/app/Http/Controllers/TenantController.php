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
        'max_branches' => $validated['max_branches'] ?? 0,
        'current_branch_count' => 1,
        'trial_ends_at' => $validated['trial_ends_at'] ?? now()->addDays(7),
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
 * GET /api/tenant/current
 * Dipanggil dari tenant subdomain
 */
public function current(Request $request)
{
    try {
        $tenant = tenant();

        if (!$tenant) {
            return ApiResponse::error('Tenant not found', null, 404);
        }

        $tenantData = DB::connection('central')
            ->table('tenants')
            ->where('id', $tenant->id)
            ->first();

        if (!$tenantData) {
            return ApiResponse::error('Tenant data not found', null, 404);
        }

        // Ambil subscription aktif
        $subscription = DB::connection('central')
            ->table('subscriptions')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->where('subscriptions.tenant_id', $tenant->id)
            ->where('subscriptions.status', 'active')
            ->select(
                'subscriptions.id',
                'subscriptions.status',
                'subscriptions.billing_cycle',
                'subscriptions.current_period_ends_at',
                'plans.name as plan_name',
                'plans.code as plan_code',
            )
            ->first();

        // Ambil branch yang sedang dipakai dari header/session
        // Branch diidentifikasi dari request header X-Branch-Id atau query param
        $branchId = $request->header('X-Branch-Id') ?? $request->get('branch_id');

        $currentBranch = null;
        if ($branchId) {
            $currentBranch = DB::table('branches')
                ->where('id', $branchId)
                ->where('is_active', true)
                ->select('id', 'name', 'address')
                ->first();
        }

        // Fallback ke main branch jika tidak ada branch dipilih
        if (!$currentBranch) {
            $currentBranch = DB::table('branches')
                ->where('is_active', true)
                ->select('id', 'name', 'address')
                ->first();
        }

        // Ambil semua branch aktif untuk switcher
        $branches = DB::table('branches')
            ->where('is_active', true)
            ->select('id', 'name', 'address')
            ->orderBy('name')
            ->get();

        return ApiResponse::success([
            'id'                   => $tenantData->id,
            'name'                 => $tenantData->name,
            'slug'                 => $tenantData->slug,
            'logo_url'             => $tenantData->logo_url,
            'status'               => $tenantData->status,
            'owner_name'           => $tenantData->owner_name,
            'owner_email'          => $tenantData->owner_email,
            'max_branches'         => $tenantData->max_branches,
            'current_branch_count' => $tenantData->current_branch_count,
            'subscription_ends_at' => $tenantData->subscription_ends_at,
            'trial_ends_at'        => $tenantData->trial_ends_at,
            'subscription'         => $subscription,
            'current_branch'       => $currentBranch,
            'branches'             => $branches,
        ], 'Tenant data retrieved successfully');

    } catch (\Exception $e) {
        Log::error('Error fetching tenant current', ['error' => $e->getMessage()]);
        return ApiResponse::error(
            'Failed to fetch tenant data',
            config('app.debug') ? $e->getMessage() : null,
            500
        );
    }
}
}
