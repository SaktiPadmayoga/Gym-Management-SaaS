<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\DomainRequest;
use App\Models\Tenant;
use App\Http\Requests\StoreDomainRequestRequest;
use App\Http\Requests\ReviewDomainRequestRequest;
use App\Http\Resources\DomainRequestResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DomainRequestController extends Controller
{
    /**
     * Resolve tenant dari X-Tenant header (untuk route tenant-facing)
     */
    protected function resolveTenantFromHeader(Request $request): Tenant
{
    $tenantSlug = $request->header('X-Tenant');

    if (!$tenantSlug) {
        throw ValidationException::withMessages([
            'X-Tenant' => 'X-Tenant header is required.',
        ]);
    }

    $tenant = Tenant::where('slug', $tenantSlug)->first();

    if (!$tenant) {
        throw ValidationException::withMessages([
            'X-Tenant' => "Tenant '{$tenantSlug}' not found.",
        ]);
    }

    // ✅ Re-initialize tenancy setelah query central Tenant model
    tenancy()->initialize($tenant);

    return $tenant;
}

    /**
     * GET /api/domain-requests
     * List semua domain requests (untuk admin SaaS - central only)
     */
    public function index(Request $request)
    {
        try {
            $query = DomainRequest::with(['tenant', 'reviewer']);

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('tenant_id')) {
                $query->where('tenant_id', $request->tenant_id);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('requested_domain', 'like', "%{$search}%")
                      ->orWhere('current_domain', 'like', "%{$search}%");
                });
            }

            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $allowedSorts = ['created_at', 'status', 'requested_domain', 'reviewed_at'];

            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
            }

            $perPage = min((int) $request->input('per_page', 15), 100);
            $requests = $query->paginate($perPage);

            return ApiResponse::success(
                DomainRequestResource::collection($requests),
                'Domain requests retrieved successfully',
                [
                    'total'       => $requests->total(),
                    'per_page'    => $requests->perPage(),
                    'current_page'=> $requests->currentPage(),
                    'last_page'   => $requests->lastPage(),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Error fetching domain requests (admin)', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return ApiResponse::error('Failed to fetch domain requests', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    /**
     * GET /api/domain-requests/my
     * List domain requests milik tenant saat ini
     */
    public function myRequests(Request $request)
    {
        try {
            $tenant = $this->resolveTenantFromHeader($request);

            $perPage = min((int) $request->input('per_page', 15), 100);

            $requests = DomainRequest::query()
                ->where('tenant_id', $tenant->id)
                ->whereNull('deleted_at')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return ApiResponse::success(
                DomainRequestResource::collection($requests),
                'Your domain requests retrieved successfully',
                [
                    'total'       => $requests->total(),
                    'per_page'    => $requests->perPage(),
                    'current_page'=> $requests->currentPage(),
                    'last_page'   => $requests->lastPage(),
                ]
            );
        } catch (ValidationException $e) {
            return ApiResponse::error($e->getMessage(), $e->errors(), 422);
        } catch (\Exception $e) {
            Log::error('Error fetching my domain requests', ['error' => $e->getMessage()]);
            return ApiResponse::error('Failed to fetch your domain requests', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    /**
     * POST /api/domain-requests
     * Buat domain request baru dari tenant
     */
    public function store(Request $request)
{
    try {
        $tenant = $this->resolveTenantFromHeader($request);

        $validated = $request->validate([
            'requested_domain' => 'required|string|max:255',
            'branch_id' => 'nullable|string',
        ]);

        // ✅ Tidak perlu specify connection, sudah switch ke tenant DB
        if ($request->filled('branch_id')) {
            $branchExists = DB::table('branches')
                ->where('id', $request->branch_id)
                ->exists();

            if (!$branchExists) {
                return ApiResponse::error('Branch not found', null, 404);
            }
        }

        // ✅ Central DB tetap explicit
        $currentDomain = DB::connection('central')
            ->table('domains')
            ->where('tenant_id', $tenant->id)
            ->where('is_primary', true)
            ->when(
                $request->filled('branch_id'),
                fn($q) => $q->where('branch_id', $request->branch_id),
                fn($q) => $q->whereNull('branch_id')
            )
            ->first();

        if (!$currentDomain) {
            return ApiResponse::error('No active primary domain found', null, 404);
        }

        $hasPending = DB::connection('central')
            ->table('domain_requests')
            ->where('tenant_id', $tenant->id)
            ->where('status', 'pending')
            ->whereNull('deleted_at')
            ->exists();

        if ($hasPending) {
            return ApiResponse::error('You already have a pending domain change request', null, 422);
        }

        $id = (string) Str::uuid();
        $now = now();

        DB::connection('central')->table('domain_requests')->insert([
            'id' => $id,
            'tenant_id' => $tenant->id,
            'branch_id' => $request->input('branch_id'),
            'current_domain' => $currentDomain->domain,
            'requested_domain' => $validated['requested_domain'],
            'status' => 'pending',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $domainRequest = DB::connection('central')
            ->table('domain_requests')
            ->where('id', $id)
            ->first();

        return ApiResponse::success(
            $domainRequest,
            'Domain change request submitted successfully',
            null,
            201
        );

    } catch (ValidationException $e) {
        return ApiResponse::error('Validation failed', $e->errors(), 422);
    } catch (\Exception $e) {
        Log::error('Error creating domain request', ['error' => $e->getMessage()]);
        return ApiResponse::error('Failed to submit domain request', config('app.debug') ? $e->getMessage() : null, 500);
    }
}

    /**
     * DELETE /api/domain-requests/{id}
     * Cancel domain request (hanya pending)
     */
    public function destroy(Request $request, string $id)
    {
        try {
            $tenant = $this->resolveTenantFromHeader($request);

            $domainRequest = DomainRequest::on('central')
                ->where('id', $id)
                ->where('tenant_id', $tenant->id)
                ->whereNull('deleted_at')
                ->first();

            if (!$domainRequest) {
                return ApiResponse::error('Domain request not found or not owned by you', null, 404);
            }

            if ($domainRequest->status !== 'pending') {
                return ApiResponse::error('Only pending requests can be cancelled', null, 422);
            }

            $domainRequest->update(['deleted_at' => now()]);

            return ApiResponse::success(null, 'Domain request cancelled successfully');
        } catch (ValidationException $e) {
            return ApiResponse::error($e->getMessage(), $e->errors(), 422);
        } catch (\Exception $e) {
            Log::error('Error cancelling domain request', ['error' => $e->getMessage()]);
            return ApiResponse::error('Failed to cancel domain request', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    /**
     * GET /api/domain-requests/{id}
     * Detail satu request (umumnya untuk admin)
     */
    public function show(string $id)
    {
        try {
            $domainRequest = DomainRequest::with(['tenant', 'reviewer'])->find($id);

            if (!$domainRequest) {
                return ApiResponse::error('Domain request not found', null, 404);
            }

            return ApiResponse::success(
                new DomainRequestResource($domainRequest),
                'Domain request retrieved successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error fetching domain request detail', ['id' => $id, 'error' => $e->getMessage()]);
            return ApiResponse::error('Failed to fetch domain request', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    /**
     * POST /api/domain-requests/{id}/review
     * Admin SaaS melakukan approve / reject
     */
    public function review(ReviewDomainRequestRequest $request, string $id)
{
    try {
        $domainRequest = DB::connection('central')
            ->table('domain_requests')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();

        if (!$domainRequest) {
            return ApiResponse::error('Domain request not found', null, 404);
        }

        if ($domainRequest->status !== 'pending') {
            return ApiResponse::error('This request has already been reviewed', null, 422);
        }

        $action = $request->input('action');

        DB::connection('central')->transaction(function () use ($domainRequest, $request, $action) {
            if ($action === 'approve') {
                // Cek domain masih available
                $domainTaken = DB::connection('central')
                    ->table('domains')
                    ->where('domain', $domainRequest->requested_domain)
                    ->exists();

                if ($domainTaken) {
                    throw new \Exception('Requested domain is no longer available.');
                }

                // ✅ Update domain di tabel domains (central DB)
                DB::connection('central')
                    ->table('domains')
                    ->where('tenant_id', $domainRequest->tenant_id)
                    ->where('is_primary', true)
                    ->when(
                        $domainRequest->branch_id,
                        fn($q) => $q->where('branch_id', $domainRequest->branch_id),
                        fn($q) => $q->whereNull('branch_id')
                    )
                    ->update([
                        'domain' => $domainRequest->requested_domain,
                        'updated_at' => now(),
                    ]);

                // ✅ Update status request
                DB::connection('central')
                    ->table('domain_requests')
                    ->where('id', $domainRequest->id)
                    ->update([
                        'status' => 'approved',
                        'reviewed_at' => now(),
                        'updated_at' => now(),
                    ]);

            } else {
                DB::connection('central')
                    ->table('domain_requests')
                    ->where('id', $domainRequest->id)
                    ->update([
                        'status' => 'rejected',
                        'rejection_reason' => $request->input('rejection_reason'),
                        'reviewed_at' => now(),
                        'updated_at' => now(),
                    ]);
            }
        });

        $updated = DB::connection('central')
            ->table('domain_requests')
            ->where('id', $id)
            ->first();

        return ApiResponse::success(
            $updated,
            $action === 'approve'
                ? 'Domain request approved successfully'
                : 'Domain request rejected successfully'
        );

    } catch (\Exception $e) {
        Log::error('Error reviewing domain request', ['id' => $id, 'error' => $e->getMessage()]);
        $message = $e->getMessage() === 'Requested domain is no longer available.'
            ? $e->getMessage()
            : 'Failed to review domain request';
        return ApiResponse::error($message, config('app.debug') ? $e->getMessage() : null, 500);
    }
}

    // Optional: jika tenant ingin edit request yang masih pending
    // public function update(Request $request, string $id)
    // {
    //     // Implementasi serupa dengan store, tapi hanya update requested_domain
    //     // dan hanya jika status pending + milik tenant yang sama
    // }
}