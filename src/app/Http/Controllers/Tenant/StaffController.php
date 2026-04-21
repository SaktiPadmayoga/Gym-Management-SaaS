<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\AssignBranchRequest;
use App\Http\Requests\Tenant\StoreStaffRequest;
use App\Http\Requests\Tenant\UpdateStaffRequest;
use App\Http\Resources\Tenant\StaffResource;
use App\Models\Tenant\Staff;
use App\Models\Tenant\StaffBranch;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        // TODO: uncomment setelah auth diterapkan
        // $branchId  = $request->header('X-Branch-Id');
        // $authStaff = $request->user();
        // if (!$authStaff->isOwner()) {
        //     if (!$branchId) {
        //         return ApiResponse::error('Branch context required', null, 422);
        //     }
        //     $query->whereHas('staffBranches', function ($q) use ($branchId) {
        //         $q->where('branch_id', $branchId)->where('is_active', true);
        //     });
        // }

        $query = Staff::query()->with(['staffBranches.branch']);

        if ($request->filled('branch_id')) {
            $query->whereHas('staffBranches', function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id)->where('is_active', true);
            });
        }

        // ✅ PERBAIKAN: Cari role di tabel global ATAU di relasi cabang
        if ($request->filled('role')) {
            $role = $request->role;
            $query->where(function ($q) use ($role) {
                // 1. Cek apakah cocok dengan role global di tabel staffs
                $q->where('role', $role)
                  // 2. ATAU cek apakah cocok dengan role di tabel staff_branches
                  ->orWhereHas('staffBranches', function ($sq) use ($role) {
                      $sq->where('role', $role)->where('is_active', true);
                  });
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $staff = $query->orderBy('name')->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'data' => StaffResource::collection($staff->items()),
            'meta' => [
                'total' => $staff->total(),
                'per_page' => $staff->perPage(),
                'current_page' => $staff->currentPage(),
            ],
        ]);
    }

    public function store(StoreStaffRequest $request)
    {
        $data = $request->validated();

        // Prioritaskan branch_id dari payload form (dropdown). 
        // Jika form tidak mengirim (null), baru fallback ke header.
        $data['branch_id'] = $data['branch_id'] ?? $request->header('X-Branch-Id');

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('staff/avatars', 'public');
        }

        $staff = Staff::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'phone'     => $data['phone'] ?? null,
            'avatar'    => $data['avatar'] ?? null,
            'role'      => $data['role'] ?? 'staff',
        ]);

        if (!empty($data['branch_id'])) {
            StaffBranch::create([
                'staff_id'  => $staff->id,
                'branch_id' => $data['branch_id'], 
                'role'      => $data['branch_role'],
                'joined_at' => now(),
            ]);
        }

        $staff->load('staffBranches.branch');

        return ApiResponse::success(new StaffResource($staff), 'Staff created successfully', 201);
    }

    public function show(Request $request, string $id)
    {
        $staff = Staff::with('staffBranches.branch')->findOrFail($id);

        // TODO: uncomment setelah auth diterapkan
        // $authStaff = $request->user();
        // $branchId  = $request->header('X-Branch-Id');
        // if (!$authStaff->isOwner()) {
        //     if (!$staff->hasAccessToBranch($branchId)) {
        //         return ApiResponse::error('Staff not found in this branch', null, 404);
        //     }
        // }

        return ApiResponse::success(new StaffResource($staff));
    }

    public function update(UpdateStaffRequest $request, string $id)
    {
        $staff = Staff::findOrFail($id);
        $data  = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($staff->avatar) {
                Storage::disk('public')->delete($staff->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('staff/avatars', 'public');
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $staff->update($data);
        $staff->load('staffBranches.branch');

        return ApiResponse::success(new StaffResource($staff), 'Staff updated successfully');
    }

    public function destroy(string $id)
    {
        $staff = Staff::findOrFail($id);

        StaffBranch::where('staff_id', $staff->id)->update(['is_active' => false]);
        $staff->delete();

        return ApiResponse::success(null, 'Staff deleted successfully');
    }

    public function assignBranch(AssignBranchRequest $request, string $id)
    {
        $staff = Staff::findOrFail($id);
        $data  = $request->validated();

        $existing = StaffBranch::withTrashed()
            ->where('staff_id', $staff->id)
            ->where('branch_id', $data['branch_id'])
            ->first();

        if ($existing) {
            $existing->restore();
            $existing->update([
                'role'      => $data['role'],
                'is_active' => true,
                'joined_at' => $data['joined_at'] ?? now(),
            ]);
            $staffBranch = $existing;
        } else {
            $staffBranch = StaffBranch::create([
                'staff_id'  => $staff->id,
                'branch_id' => $data['branch_id'],
                'role'      => $data['role'],
                'joined_at' => $data['joined_at'] ?? now(),
            ]);
        }

        $staffBranch->load('branch');

        return ApiResponse::success($staffBranch, 'Staff assigned to branch successfully');
    }

    public function revokeBranch(string $id, string $branchId)
    {
        $staffBranch = StaffBranch::where('staff_id', $id)
            ->where('branch_id', $branchId)
            ->firstOrFail();

        $staffBranch->update(['is_active' => false]);
        $staffBranch->delete();

        return ApiResponse::success(null, 'Staff branch access revoked');
    }

    public function branches(string $id)
    {
        $staff = Staff::with('staffBranches.branch')->findOrFail($id);

        return ApiResponse::success(
            $staff->staffBranches->map(fn($sb) => [
                'id'        => $sb->id,
                'branch'    => $sb->branch,
                'role'      => $sb->role,
                'is_active' => $sb->is_active,
                'joined_at' => $sb->joined_at?->toIso8601String(),
            ])
        );
    }
}