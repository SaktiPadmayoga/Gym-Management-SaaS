<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\AssignMemberBranchRequest;
use App\Http\Requests\Tenant\StoreMemberRequest;
use App\Http\Requests\Tenant\UpdateMemberRequest;
use App\Http\Resources\Tenant\MemberBranchResource;
use App\Http\Resources\Tenant\MemberResource;
use App\Models\Tenant\Member;
use App\Models\Tenant\MemberBranch;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MemberController extends Controller
{
    // =============================================
    // Helpers
    // =============================================

    /**
     * Generate member code unik per branch
     * Format: GYM-{BRANCH_PREFIX}-{RANDOM}
     * Contoh: GYM-MN-00123
     */
    private function generateMemberCode(string $branchId): string
    {
        do {
            $code = 'GYM-' . strtoupper(Str::random(2)) . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
            $exists = MemberBranch::where('branch_id', $branchId)->where('member_code', $code)->exists();
        } while ($exists);

        return $code;
    }

    // =============================================
    // CRUD
    // =============================================

    /**
     * List member.
     * - Dengan branch context → filter per branch
     * - Tanpa branch context (owner) → semua member
     */
    public function index(Request $request)
    {
        // TODO: uncomment setelah auth diterapkan
        // $authStaff = $request->user();
        $branchId = $request->header('X-Branch-Id');

        $query = Member::query()->with(['memberBranches.branch', 'primaryBranch']);

        // Filter per branch jika ada context
        if ($branchId) {
            $query->whereHas('memberBranches', fn($q) => $q->where('branch_id', $branchId));

            // Attach current_membership ke setiap member
            $query->with(['memberBranches' => fn($q) => $q->where('branch_id', $branchId)]);
        }

        // Filter opsional
        if ($request->filled('status')) {
            if ($branchId) {
                $query->whereHas('memberBranches', fn($q) =>
                    $q->where('branch_id', $branchId)->where('status', $request->status)
                );
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter member yang akan expired dalam N hari
        if ($request->filled('expiring_in_days') && $branchId) {
            $days = (int) $request->expiring_in_days;
            $query->whereHas('memberBranches', fn($q) =>
                $q->where('branch_id', $branchId)
                  ->where('status', 'active')
                  ->whereBetween('expires_at', [now(), now()->addDays($days)])
            );
        }

        $members = $query->orderBy('name')->paginate($request->get('per_page', 15));

        return ApiResponse::success(MemberResource::collection($members)->response()->getData(true));
    }

    /**
     * Create member + opsional assign ke branch
     */
    public function store(StoreMemberRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('members/avatars', 'public');
        }

        $member = Member::create([
            'name'               => $data['name'],
            'email'              => $data['email'] ?? null,
            'phone'              => $data['phone'] ?? null,
            'emergency_contact'  => $data['emergency_contact'] ?? null,
            'gender'             => $data['gender'] ?? null,
            'date_of_birth'      => $data['date_of_birth'] ?? null,
            'avatar'             => $data['avatar'] ?? null,
            'address'            => $data['address'] ?? null,
            'id_card_number'     => $data['id_card_number'] ?? null,
            'password'           => isset($data['password']) ? Hash::make($data['password']) : null,
            'member_since'       => now()->toDateString(),
            'status'             => 'inactive',
        ]);

        // Assign ke branch jika ada
        $branchId = $data['branch_id'] ?? $request->header('X-Branch-Id');

        if ($branchId) {
            $memberCode = $data['member_code'] ?? $this->generateMemberCode($branchId);
            $status     = ($data['expires_at'] ?? null) ? 'active' : 'inactive';

            MemberBranch::create([
                'member_id'   => $member->id,
                'branch_id'   => $branchId,
                'status'      => $status,
                'plan_id'     => $data['plan_id'] ?? null,
                'started_at'  => $data['started_at'] ?? now()->toDateString(),
                'expires_at'  => $data['expires_at'] ?? null,
                'member_code' => $memberCode,
                'is_primary'  => $data['is_primary'] ?? true,
                'joined_at'   => now(),
            ]);

            // Update status global member
            if ($status === 'active') {
                $member->update(['status' => 'active']);
            }
        }

        $member->load('memberBranches.branch', 'primaryBranch');

        return ApiResponse::success(new MemberResource($member), 'Member created successfully', 201);
    }

    /**
     * Detail member
     */
    public function show(Request $request, string $id)
    {
        $member   = Member::with('memberBranches.branch', 'primaryBranch')->findOrFail($id);
        $branchId = $request->header('X-Branch-Id');

        // Attach current_membership jika ada branch context
        if ($branchId) {
            $member->current_membership = $member->getMembershipInBranch($branchId);
        }

        return ApiResponse::success(new MemberResource($member));
    }

    /**
     * Update data member
     */
    public function update(UpdateMemberRequest $request, string $id)
    {
        $member = Member::findOrFail($id);
        $data   = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($member->avatar) {
                Storage::disk('public')->delete($member->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('members/avatars', 'public');
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $member->update($data);
        $member->load('memberBranches.branch', 'primaryBranch');

        return ApiResponse::success(new MemberResource($member), 'Member updated successfully');
    }

    /**
     * Soft delete member
     */
    public function destroy(string $id)
    {
        $member = Member::findOrFail($id);

        MemberBranch::where('member_id', $member->id)->update(['status' => 'cancelled']);
        $member->update(['is_active' => false, 'status' => 'inactive']);
        $member->delete();

        return ApiResponse::success(null, 'Member deleted successfully');
    }

    // =============================================
    // Branch Membership
    // =============================================

    /**
     * Assign member ke branch baru
     */
    public function assignBranch(AssignMemberBranchRequest $request, string $id)
    {
        $member = Member::findOrFail($id);
        $data   = $request->validated();

        $existing = MemberBranch::withTrashed()
            ->where('member_id', $member->id)
            ->where('branch_id', $data['branch_id'])
            ->first();

        $memberCode = $data['member_code'] ?? $this->generateMemberCode($data['branch_id']);
        $status     = ($data['expires_at'] ?? null) ? 'active' : 'inactive';

        if ($existing) {
            $existing->restore();
            $existing->update([
                'status'      => $status,
                'plan_id'     => $data['plan_id'] ?? $existing->plan_id,
                'started_at'  => $data['started_at'] ?? now()->toDateString(),
                'expires_at'  => $data['expires_at'] ?? null,
                'member_code' => $memberCode,
                'is_primary'  => $data['is_primary'] ?? false,
                'notes'       => $data['notes'] ?? null,
                'joined_at'   => $existing->joined_at ?? now(),
            ]);
            $memberBranch = $existing;
        } else {
            $memberBranch = MemberBranch::create([
                'member_id'   => $member->id,
                'branch_id'   => $data['branch_id'],
                'status'      => $status,
                'plan_id'     => $data['plan_id'] ?? null,
                'started_at'  => $data['started_at'] ?? now()->toDateString(),
                'expires_at'  => $data['expires_at'] ?? null,
                'member_code' => $memberCode,
                'is_primary'  => $data['is_primary'] ?? false,
                'notes'       => $data['notes'] ?? null,
                'joined_at'   => now(),
            ]);
        }

        // Jika is_primary, reset primary lain
        if ($data['is_primary'] ?? false) {
            MemberBranch::where('member_id', $member->id)
                ->where('id', '!=', $memberBranch->id)
                ->update(['is_primary' => false]);
        }

        $memberBranch->load('branch');

        return ApiResponse::success(new MemberBranchResource($memberBranch), 'Member assigned to branch');
    }

    /**
     * Update status membership di branch
     * Dipakai untuk: freeze, unfreeze, cancel, renew
     */
    public function updateMembership(Request $request, string $id, string $branchId)
    {
        $request->validate([
            'status'      => ['required', 'in:active,inactive,expired,frozen,cancelled'],
            'expires_at'  => ['nullable', 'date'],
            'frozen_until'=> ['nullable', 'date', 'after:today'],
            'plan_id'     => ['nullable', 'uuid'],
            'notes'       => ['nullable', 'string'],
        ]);

        $memberBranch = MemberBranch::where('member_id', $id)
            ->where('branch_id', $branchId)
            ->firstOrFail();

        $updateData = ['status' => $request->status];

        if ($request->filled('expires_at'))   $updateData['expires_at']   = $request->expires_at;
        if ($request->filled('plan_id'))       $updateData['plan_id']       = $request->plan_id;
        if ($request->filled('notes'))         $updateData['notes']         = $request->notes;

        // Handle freeze
        if ($request->status === 'frozen') {
            $updateData['frozen_at']    = now()->toDateString();
            $updateData['frozen_until'] = $request->frozen_until;
        }

        // Handle unfreeze — extend expires_at by frozen duration
        if ($request->status === 'active' && $memberBranch->isFrozen()) {
            $frozenDays = now()->diffInDays($memberBranch->frozen_at);
            $updateData['freeze_days_used'] = $memberBranch->freeze_days_used + $frozenDays;
            $updateData['frozen_at']        = null;
            $updateData['frozen_until']     = null;

            if ($memberBranch->expires_at) {
                $updateData['expires_at'] = $memberBranch->expires_at->addDays($frozenDays)->toDateString();
            }
        }

        $memberBranch->update($updateData);

        // Sync status global member
        $this->syncMemberStatus($id);

        return ApiResponse::success(new MemberBranchResource($memberBranch->fresh()), 'Membership updated');
    }

    /**
     * Cabut membership dari branch
     */
    public function revokeBranch(string $id, string $branchId)
    {
        $memberBranch = MemberBranch::where('member_id', $id)
            ->where('branch_id', $branchId)
            ->firstOrFail();

        $memberBranch->update(['status' => 'cancelled']);
        $memberBranch->delete();

        $this->syncMemberStatus($id);

        return ApiResponse::success(null, 'Member branch access revoked');
    }

    /**
     * Semua branch & membership member ini
     */
    public function branches(string $id)
    {
        $member = Member::with('memberBranches.branch')->findOrFail($id);

        return ApiResponse::success(
            MemberBranchResource::collection($member->memberBranches)
        );
    }

    // =============================================
    // Private Helpers
    // =============================================

    /**
     * Sync status global member berdasarkan status di semua branch
     */
    private function syncMemberStatus(string $memberId): void
    {
        $member = Member::findOrFail($memberId);

        $activeBranch = MemberBranch::where('member_id', $memberId)
            ->where('status', 'active')
            ->exists();

        $frozenBranch = MemberBranch::where('member_id', $memberId)
            ->where('status', 'frozen')
            ->exists();

        if ($activeBranch) {
            $member->update(['status' => 'active']);
        } elseif ($frozenBranch) {
            $member->update(['status' => 'frozen']);
        } else {
            $member->update(['status' => 'inactive']);
        }
    }
}