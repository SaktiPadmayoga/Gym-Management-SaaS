<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Domain;
use App\Http\Resources\TenantResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreTenantRequest;
use Illuminate\Support\Facades\Hash;
use App\Services\TenantService;
use App\Services\NotificationService;
use Throwable;
use App\Support\ErrorResolver;




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
        try {
            $tenant = TenantService::create($request->validated());

            return ApiResponse::success(
                new TenantResource($tenant),
                'Tenant created successfully',
                null,
                201
            );

        } catch (Throwable $e) {
            return ApiResponse::error(
                'Gagal membuat tenant',
                ErrorResolver::resolve($e),
                500
            );
        }
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
        try {
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

        $oldStatus = $tenant->status;
        $tenant->update($validated);

        if (
            isset($validated['status'])
            && $validated['status'] !== $oldStatus
            && in_array($validated['status'], ['suspended', 'expired'])
        ) {
            app(NotificationService::class)->notifyTenantDeactivated(
                $tenant->fresh(),
                $validated['status']
            );
        }

        return ApiResponse::success(
            new TenantResource($tenant->fresh(['domains'])),
            'Tenant updated successfully',
            null,
            200
        );
    }catch (Throwable $e) {
            return ApiResponse::error(
                'Gagal mengupdate tenant',
                ErrorResolver::resolve($e),
                500
            );
        }
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

        $tenantData = \App\Models\Tenant::find($tenant->id);

        if (!$tenantData) {
            return ApiResponse::error('Tenant data not found', null, 404);
        }

        // Ambil subscription terbaru
        $subscription = DB::connection('central')
            ->table('subscriptions')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->where('subscriptions.tenant_id', $tenant->id)
            ->whereIn('subscriptions.status', ['active', 'expired', 'trial', 'pending'])
            ->select(
                'subscriptions.id',
                'subscriptions.status',
                'subscriptions.billing_cycle',
                'subscriptions.current_period_ends_at',
                'plans.name as plan_name',
                'plans.code as plan_code',
            )
            ->orderBy('subscriptions.created_at', 'desc')
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

        $currentDomainId = Domain::where('tenant_id', $tenant->id)
        ->where('is_primary', true)
        ->value('id');


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
            'subscription_ends_at' => $subscription?->current_period_ends_at ?? $tenantData->subscription_ends_at,
            'trial_ends_at'        => $subscription?->trial_ends_at ?? $tenantData->trial_ends_at,
            'subscription'         => $subscription,
            'current_branch'       => $currentBranch,
            'branches'             => $branches,
            'current_domain_id'    => $currentDomainId,

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

    /**
     * POST /api/tenant/logo
     * Upload logo gym ke R2. Hanya bisa diakses oleh owner tenant itu sendiri.
     */
    public function uploadLogo(Request $request)
    {
        try {
            $request->validate([
                'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
            ]);

            $tenantModel = tenant();
            if (!$tenantModel) {
                return ApiResponse::error('Tenant context not found', null, 404);
            }

            // Ambil data tenant dari central DB
            $tenantData = DB::connection('central')
                ->table('tenants')
                ->where('id', $tenantModel->id)
                ->first();

            if (!$tenantData) {
                return ApiResponse::error('Tenant not found', null, 404);
            }

            // Disk yang dipakai: R2 jika ada key (production), public disk jika tidak (local dev)
            $disk = env('CLOUDFLARE_R2_ACCESS_KEY_ID') ? 'r2' : 'public';

            // Hapus logo lama jika ada dan bukan URL eksternal
            $oldLogo = $tenantData->logo_url;
            if ($oldLogo && !str_starts_with($oldLogo, 'http')) {
                Storage::disk($disk)->delete($oldLogo);
            }

            // Upload logo baru — isolasi per-tenant
            $path = $request->file('logo')->store(
                "tenant_{$tenantModel->id}/logos",
                $disk
            );

            // Update kolom logo_url di central DB
            DB::connection('central')
                ->table('tenants')
                ->where('id', $tenantModel->id)
                ->update(['logo_url' => $path, 'updated_at' => now()]);

            $logoUrl = $disk === 'r2'
                ? Storage::disk('r2')->url($path)
                : '/storage/' . $path;

            Log::info('Logo uploaded', ['tenant_id' => $tenantModel->id, 'path' => $path]);

            return ApiResponse::success([
                'logo_url' => $logoUrl,
                'path'     => $path,
            ], 'Logo berhasil diupload');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        } catch (\Exception $e) {
            Log::error('uploadLogo error', ['message' => $e->getMessage()]);
            return ApiResponse::error(
                'Gagal upload logo',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }
}

