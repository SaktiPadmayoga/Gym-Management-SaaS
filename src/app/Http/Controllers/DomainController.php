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
    private function getBaseQuery(Request $request)
    {
        $query = Domain::query();

        if ($tenantSlug = $request->header('X-Tenant')) {
            $tenant = Tenant::where('slug', $tenantSlug)->first();
            
            if (!$tenant) {
                return $query->whereRaw('1 = 0'); 
            }
            
            $query->where('tenant_id', $tenant->id);
            
            $request->attributes->set('resolved_tenant_id', $tenant->id);
        } else {
            if (!auth()->guard('admin')->check()) {
                abort(403, 'Akses ditolak. Header X-Tenant wajib disertakan.');
            }
        }
        return $query;
    }

    public function index(Request $request)
    {
        try {
            $query = clone $this->getBaseQuery($request);
            $query->with(['tenant']);

            if ($request->boolean('with_branch')) {
                $query->with('branch');
            }

            if ($request->header('X-Tenant') && !$request->attributes->get('resolved_tenant_id')) {
                return ApiResponse::error('Invalid tenant', null, 400);
            }

            if ($request->filled('tenant_id') && !$request->header('X-Tenant')) {
                $query->where('tenant_id', $request->tenant_id);
            }

            if ($request->filled('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->has('is_primary')) {
                $query->where('is_primary', filter_var($request->is_primary, FILTER_VALIDATE_BOOLEAN));
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('domain', 'like', "%{$search}%")
                      ->orWhereHas('tenant', function ($tq) use ($search) {
                          $tq->where('name', 'like', "%{$search}%");
                      });
                });
            }

            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $allowedSortFields = ['domain', 'type', 'is_primary', 'created_at', 'updated_at'];

            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
            }

            $perPage = min((int)$request->input('per_page', 10), 100);
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
            Log::error('Error fetching domains', ['error' => $e->getMessage()]);
            return ApiResponse::error('Failed to fetch domains', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    /**
     * Store a newly created domain.
     */
    public function store(StoreDomainRequest $request)
    {
        try {
            $this->getBaseQuery($request); 
            $resolvedTenantId = $request->attributes->get('resolved_tenant_id');

            if ($request->header('X-Tenant') && !$resolvedTenantId) {
                return ApiResponse::error('Invalid tenant', null, 400);
            }

            $validated = $request->validated();
            $validated['id'] = (string) Str::uuid();

            if ($resolvedTenantId) {
                $validated['tenant_id'] = $resolvedTenantId;
            }

            $domain = Domain::create($validated);
            $domain->load(['tenant']);

            return ApiResponse::success(new DomainResource($domain), 'Domain created successfully', null, 201);

        } catch (\Exception $e) {
            Log::error('Error creating domain', ['error' => $e->getMessage()]);
            return ApiResponse::error('Failed to create domain', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }


    public function show(Request $request, string $id)
    {
        try {

            $domain = clone $this->getBaseQuery($request)->with('tenant')->find($id);

            if (!$domain) {
                return ApiResponse::error('Domain not found or unauthorized', null, 404);
            }

            return ApiResponse::success(new DomainResource($domain), 'Domain retrieved successfully');

        } catch (\Exception $e) {
            Log::error('Error fetching domain', ['error' => $e->getMessage(), 'id' => $id]);
            return ApiResponse::error('Failed to fetch domain', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }


    public function update(UpdateDomainRequest $request, string $id)
    {
        try {
            $domain = clone $this->getBaseQuery($request)->find($id);

            if (!$domain) {
                return ApiResponse::error('Domain not found or unauthorized', null, 404);
            }

            $validated = $request->validated();
            
            // Cegah modifikasi tenant_id jika request datang dari tenant API
            if ($request->header('X-Tenant')) {
                unset($validated['tenant_id']); 
            }

            $domain->update($validated);
            $domain->load(['tenant']);

            return ApiResponse::success(new DomainResource($domain), 'Domain updated successfully');

        } catch (\Exception $e) {
            Log::error('Error updating domain', ['error' => $e->getMessage(), 'id' => $id]);
            return ApiResponse::error('Failed to update domain', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    /**
     * Remove the specified domain.
     */
    public function destroy(Request $request, string $id)
    {
        try {
            // Isolasi Tenant
            $domain = clone $this->getBaseQuery($request)->find($id);

            if (!$domain) {
                return ApiResponse::error('Domain not found or unauthorized', null, 404);
            }

            $domain->delete();

            return ApiResponse::success(null, 'Domain deleted successfully');

        } catch (\Exception $e) {
            Log::error('Error deleting domain', ['error' => $e->getMessage(), 'id' => $id]);
            return ApiResponse::error('Failed to delete domain', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    /**
     * Toggle primary status of the domain.
     */
    public function togglePrimary(Request $request, string $id)
    {
        try {
            // Isolasi Tenant
            $domain = clone $this->getBaseQuery($request)->find($id);

            if (!$domain) {
                return ApiResponse::error('Domain not found or unauthorized', null, 404);
            }

            // Jika akan diset menjadi primary, hapus primary lain di branch & tenant yang sama
            if (!$domain->is_primary) {
                Domain::where('tenant_id', $domain->tenant_id)
                    ->where('branch_id', $domain->branch_id)
                    ->where('id', '!=', $domain->id)
                    ->update(['is_primary' => false]);
            }

            $domain->is_primary = !$domain->is_primary;
            $domain->save();
            $domain->load(['tenant']);

            return ApiResponse::success(new DomainResource($domain), 'Domain primary status updated successfully');

        } catch (\Exception $e) {
            Log::error('Error toggling domain primary status', ['error' => $e->getMessage(), 'id' => $id]);
            return ApiResponse::error('Failed to update domain primary status', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }
}