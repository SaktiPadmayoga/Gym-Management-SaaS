<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Domain;
use App\Http\Requests\Tenant\StoreBranchRequest;
use App\Http\Requests\Tenant\UpdateBranchRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\BranchResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Branch::query();

            if ($request->has('is_active')) {
                $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('branch_code', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $allowedSortFields = ['name', 'branch_code', 'city', 'is_active', 'created_at', 'updated_at'];

            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
            }

            $perPage = min((int)$request->input('per_page', 15), 100);
            $branches = $query->paginate($perPage);

            // Hindari N+1 — ambil semua domains sekaligus dari central
            $branchIds = $branches->pluck('id')->toArray();
            $domainsMap = Domain::whereIn('branch_id', $branchIds)
                ->get()
                ->groupBy('branch_id');

            $branches->each(function ($branch) use ($domainsMap) {
                $branch->centralDomains = $domainsMap->get($branch->id, collect());
            });

            return ApiResponse::success(
                BranchResource::collection($branches),
                'Branches retrieved successfully',
                [
                    'total' => $branches->total(),
                    'per_page' => $branches->perPage(),
                    'current_page' => $branches->currentPage(),
                    'last_page' => $branches->lastPage(),
                ]
            );

        } catch (\Exception $e) {
            Log::error('Error fetching branches', ['error' => $e->getMessage()]);
            return ApiResponse::error('Failed to fetch branches', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    public function store(StoreBranchRequest $request)
    {
        try {
            
            $validated = $request->validated();
            $validated['id'] = (string) Str::uuid();

            $branch = Branch::create($validated);

            return ApiResponse::success(
                new BranchResource($branch),
                'Branch created successfully',
                null,
                201
            );

        } catch (\Exception $e) {
            Log::error('Error creating branch', ['error' => $e->getMessage()]);
            return ApiResponse::error('Failed to create branch', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    public function show(string $id)
    {
        try {
            $branch = Branch::find($id);

            if (!$branch) {
                return ApiResponse::error('Branch not found', null, 404);
            }

            return ApiResponse::success(
                new BranchResource($branch),
                'Branch retrieved successfully'
            );

        } catch (\Exception $e) {
            Log::error('Error fetching branch', ['error' => $e->getMessage(), 'id' => $id]);
            return ApiResponse::error('Failed to fetch branch', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    public function update(UpdateBranchRequest $request, string $id)
    {
        try {
            $branch = Branch::find($id);

            if (!$branch) {
                return ApiResponse::error('Branch not found', null, 404);
            }

            $validated = $request->validated();
            $branch->update($validated);

            return ApiResponse::success(
                new BranchResource($branch),
                'Branch updated successfully'
            );

        } catch (\Exception $e) {
            Log::error('Error updating branch', ['error' => $e->getMessage(), 'id' => $id]);
            return ApiResponse::error('Failed to update branch', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $branch = Branch::find($id);

            if (!$branch) {
                return ApiResponse::error('Branch not found', null, 404);
            }

            $branch->update([
                'is_active' => false
            ]);

            // Hapus domain terkait di central
            Domain::where('branch_id', $id)->delete();

            $branch->delete();

            return ApiResponse::success(null, 'Branch deleted successfully');

        } catch (\Exception $e) {
            Log::error('Error deleting branch', ['error' => $e->getMessage(), 'id' => $id]);
            return ApiResponse::error('Failed to delete branch', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    public function toggleActive(string $id)
    {
        try {
            $branch = Branch::find($id);

            if (!$branch) {
                return ApiResponse::error('Branch not found', null, 404);
            }

            $branch->is_active = !$branch->is_active;
            $branch->save();

            return ApiResponse::success(
                new BranchResource($branch),
                'Branch status updated successfully'
            );

        } catch (\Exception $e) {
            Log::error('Error toggling branch status', ['error' => $e->getMessage(), 'id' => $id]);
            return ApiResponse::error('Failed to update branch status', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }
}