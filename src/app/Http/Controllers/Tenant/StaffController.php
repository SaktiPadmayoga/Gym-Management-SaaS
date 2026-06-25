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
        $query = Staff::query()->with(['staffBranches.branch', 'staffBranches.role']);

        if ($request->filled('branch_id')) {
            $query->whereHas('staffBranches', function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id)->where('is_active', true);
            });
        }

        if ($request->filled('role')) {
            $role = $request->role;
            $query->where(function ($q) use ($role) {
                $q->where('role', $role)
                  ->orWhereHas('staffBranches.role', function ($sq) use ($role) {
                      $sq->where('name', $role)->where('staff_branches.is_active', true);
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
        $currentUser = $request->user('staff') ?? auth('staff')->user();
        if ($currentUser && !$currentUser->isOwner()) {
            return ApiResponse::error('Anda tidak memiliki izin untuk menambah staf baru.', null, 403);
        }
        $data = $request->validated();
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
            $role = \App\Models\Tenant\Role::where('name', $data['branch_role'])->firstOrFail();

            StaffBranch::create([
                'staff_id'  => $staff->id,
                'branch_id' => $data['branch_id'], 
                'role_id'   => $role->id,
                'joined_at' => now(),
            ]);
        }
        $staff->load(['staffBranches.branch', 'staffBranches.role']);
        return ApiResponse::success(new StaffResource($staff), 'Staff created successfully', 201);
    }

    public function show(Request $request, string $id)
    {
        $staff = Staff::with(['staffBranches.branch', 'staffBranches.role'])->findOrFail($id);
        return ApiResponse::success(new StaffResource($staff));
    }

    public function update(UpdateStaffRequest $request, string $id)
    {
        $staff = Staff::findOrFail($id);
        $data  = $request->validated();

        $currentUser = $request->user('staff') ?? auth('staff')->user();
        if ($currentUser && !$currentUser->isOwner()) {
            if ($currentUser->id !== $staff->id) {
                return ApiResponse::error('Anda tidak memiliki izin untuk mengubah data staf lain.', null, 403);
            }
            // Non-owner cannot change their own role or active status
            unset($data['role']);
            unset($data['is_active']);
        }

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
        $staff->load(['staffBranches.branch', 'staffBranches.role']);

        return ApiResponse::success(new StaffResource($staff), 'Staff updated successfully');
    }

    public function destroy(string $id)
    {
        $staff = Staff::findOrFail($id);

        $currentUser = request()->user('staff') ?? auth('staff')->user();
        if ($currentUser && !$currentUser->isOwner()) {
            return ApiResponse::error('Anda tidak memiliki izin untuk menghapus staf.', null, 403);
        }

        if ($currentUser && $currentUser->id === $staff->id) {
            return ApiResponse::error('Anda tidak dapat menghapus akun Anda sendiri!', null, 403);
        }

        StaffBranch::where('staff_id', $staff->id)->update(['is_active' => false]);
        $staff->delete();

        return ApiResponse::success(null, 'Staff deleted successfully');
    }

    public function assignBranch(AssignBranchRequest $request, string $id)
    {
        $currentUser = $request->user('staff') ?? auth('staff')->user();
        if ($currentUser && !$currentUser->isOwner()) {
            return ApiResponse::error('Anda tidak memiliki izin untuk mengelola cabang staf.', null, 403);
        }

        $staff = Staff::findOrFail($id);
        $data  = $request->validated();

        $role = \App\Models\Tenant\Role::where('name', $data['role'])
            ->orWhere('id', $data['role'])
            ->firstOrFail();

        $existing = StaffBranch::withTrashed()
            ->where('staff_id', $staff->id)
            ->where('branch_id', $data['branch_id'])
            ->first();

        if ($existing) {
            $existing->restore();
            $existing->update([
                'role_id'   => $role->id,
                'is_active' => true,
                'joined_at' => $data['joined_at'] ?? now(),
            ]);
            $staffBranch = $existing;
        } else {
            $staffBranch = StaffBranch::create([
                'staff_id'  => $staff->id,
                'branch_id' => $data['branch_id'],
                'role_id'   => $role->id,
                'joined_at' => $data['joined_at'] ?? now(),
            ]);
        }

        $staffBranch->load(['branch', 'role']);

        return ApiResponse::success($staffBranch, 'Staff assigned to branch successfully');
    }

    public function revokeBranch(string $id, string $branchId)
    {
        $currentUser = request()->user('staff') ?? auth('staff')->user();
        if ($currentUser && !$currentUser->isOwner()) {
            return ApiResponse::error('Anda tidak memiliki izin untuk mengelola cabang staf.', null, 403);
        }

        $staffBranch = StaffBranch::where('staff_id', $id)
            ->where('branch_id', $branchId)
            ->firstOrFail();

        $staffBranch->update(['is_active' => false]);
        $staffBranch->delete();

        return ApiResponse::success(null, 'Staff branch access revoked');
    }

    public function branches(string $id)
    {
        $staff = Staff::with(['staffBranches.branch', 'staffBranches.role'])->findOrFail($id);

        return ApiResponse::success(
            $staff->staffBranches->map(fn($sb) => [
                'id'        => $sb->id,
                'branch'    => $sb->branch,
                'role'      => $sb->role?->name,
                'role_id'   => $sb->role_id,
                'is_active' => $sb->is_active,
                'joined_at' => $sb->joined_at?->toIso8601String(),
            ])
        );
    }
}