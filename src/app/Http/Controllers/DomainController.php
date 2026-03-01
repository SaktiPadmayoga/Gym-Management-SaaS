<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\Tenant;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\DomainResource;
use App\Http\Requests\StoreDomainRequest;
use App\Http\Requests\UpdateDomainRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DomainController extends Controller
{
    /**
     * Display a listing of domains.
     */

    public function index(Request $request)
    {
        try {
            $query = Domain::query()->with(['tenant']);  // Hanya load tenant (central table)

            // Jika user minta branch info via query param (opsional)
            if ($request->boolean('with_branch')) {
                $query->with('branch');
            }

                if ($tenantSlug = $request->header('X-Tenant')) {
                    $tenant = Tenant::where('slug', $tenantSlug)->first();
                    if ($tenant) {
                        $query->where('tenant_id', $tenant->id);
                    } else {
                        // Optional: return error jika slug salah, atau skip filter
                        return response()->json(['error' => 'Invalid tenant'], 400);
                    }
                }

                // Filter by tenant (manual override)
                if ($request->filled('tenant_id')) {
                    $query->where('tenant_id', $request->tenant_id);
                }

                // Filter by branch
                if ($request->filled('branch_id')) {
                    $query->where('branch_id', $request->branch_id);
                }

                // Filter by type
                if ($request->filled('type')) {
                    $query->where('type', $request->type);
                }

                // Filter by is_primary
                if ($request->has('is_primary')) {
                    $query->where('is_primary', filter_var($request->is_primary, FILTER_VALIDATE_BOOLEAN));
                }

                // Search
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('domain', 'like', "%{$search}%")
                        ->orWhereHas('tenant', function ($tq) use ($search) {
                            $tq->where('name', 'like', "%{$search}%");
                        });
                    });
                }

                // Sorting
                $sortBy = $request->input('sort_by', 'created_at');
                $sortOrder = $request->input('sort_order', 'desc');
                $allowedSortFields = ['domain', 'type', 'is_primary', 'created_at', 'updated_at'];

                if (in_array($sortBy, $allowedSortFields)) {
                    $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
                }

                // Pagination
                $perPage = min((int)$request->input('per_page', 15), 100);

            $domains = $query->paginate($perPage);

            return ApiResponse::success(
                DomainResource::collection($domains),
                'Domains retrieved successfully',
                [
                    'total' => $domains->total(),
                    'per_page' => $domains->perPage(),
                    'current_page' => $domains->currentPage(),
                    'last_page' => $domains->lastPage(),
                ]
            );

        } catch (\Exception $e) {
            Log::error('Error fetching domains', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return ApiResponse::error(
                'Failed to fetch domains',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

    /**
     * Store a newly created domain.
     */
    public function store(StoreDomainRequest $request)
    {
        try {
            $validated = $request->validated();
            $validated['id'] = (string) Str::uuid();

            $domain = Domain::create($validated);
            $domain->load(['tenant']);

            return ApiResponse::success(
                new DomainResource($domain),
                'Domain created successfully',
                null,
                201
            );

        } catch (\Exception $e) {
            Log::error('Error creating domain', [
                'error' => $e->getMessage(),
                'data' => $request->validated()
            ]);

            return ApiResponse::error(
                'Failed to create domain',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

    /**
     * Display the specified domain.
     */
    public function show(string $id)
    {
        try {
            $domain = Domain::with('tenant')->findOrFail($id);

            // Optional: jika ada X-Tenant, cek apakah domain milik tenant tersebut
            if ($tenantSlug = request()->header('X-Tenant')) {
                $tenant = Tenant::where('slug', $tenantSlug)->first();
                if ($tenant && $domain->tenant_id !== $tenant->id) {
                    abort(403, 'Domain does not belong to this tenant');
                }
            }

            return ApiResponse::success(
                new DomainResource($domain),
                'Domain retrieved successfully'
            );

        } catch (\Exception $e) {
            Log::error('Error fetching domain', ['error' => $e->getMessage(), 'id' => $id]);

            return ApiResponse::error(
                'Failed to fetch domain',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

    /**
     * Update the specified domain.
     */
    public function update(UpdateDomainRequest $request, string $id)
    {
        try {
            $domain = Domain::find($id);

            if (!$domain) {
                return ApiResponse::error('Domain not found', null, 404);
            }

            $domain->update($request->validated());
            $domain->load(['tenant']);

            return ApiResponse::success(
                new DomainResource($domain),
                'Domain updated successfully'
            );

        } catch (\Exception $e) {
            Log::error('Error updating domain', [
                'error' => $e->getMessage(),
                'id' => $id,
                'data' => $request->validated()
            ]);

            return ApiResponse::error(
                'Failed to update domain',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

    /**
     * Remove the specified domain.
     */
    public function destroy(string $id)
    {
        try {
            $domain = Domain::find($id);

            if (!$domain) {
                return ApiResponse::error('Domain not found', null, 404);
            }

            $domain->delete();

            return ApiResponse::success(
                null,
                'Domain deleted successfully'
            );

        } catch (\Exception $e) {
            Log::error('Error deleting domain', ['error' => $e->getMessage(), 'id' => $id]);

            return ApiResponse::error(
                'Failed to delete domain',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

    /**
     * Toggle primary status of the domain.
     */
    public function togglePrimary(string $id)
    {
        try {
            $domain = Domain::find($id);

            if (!$domain) {
                return ApiResponse::error('Domain not found', null, 404);
            }

            // If setting as primary, unset other primary domains for the same tenant/branch
            if (!$domain->is_primary) {
                Domain::where('tenant_id', $domain->tenant_id)
                    ->where('branch_id', $domain->branch_id)
                    ->where('id', '!=', $domain->id)
                    ->update(['is_primary' => false]);
            }

            $domain->is_primary = !$domain->is_primary;
            $domain->save();
            $domain->load(['tenant']);

            return ApiResponse::success(
                new DomainResource($domain),
                'Domain primary status updated successfully'
            );

        } catch (\Exception $e) {
            Log::error('Error toggling domain primary status', ['error' => $e->getMessage(), 'id' => $id]);

            return ApiResponse::error(
                'Failed to update domain primary status',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }
}
