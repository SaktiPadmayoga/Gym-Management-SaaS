<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreMemberRequest;
use App\Http\Requests\Tenant\UpdateMemberRequest;
use App\Http\Resources\Tenant\MemberResource;
use App\Http\Resources\Tenant\MembershipResource;
use App\Models\Tenant\Member;
use App\Models\Tenant\Membership;
use App\Models\Tenant\MembershipPlan;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MemberController extends Controller
{
    // =============================================
    // CRUD MEMBER PROFILE
    // =============================================

    /**
     * List member dengan filter lengkap
     */
    public function index(Request $request)
    {
        $query = Member::query()->with(['homeBranch', 'memberships.plan']);

        if ($request->filled('home_branch_id')) {
            $query->where('home_branch_id', $request->home_branch_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
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

        $members = $query->orderBy('name')->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'data' => MemberResource::collection($members->items()),
            'meta' => [
                'total' => $members->total(),
                'per_page' => $members->perPage(),
                'current_page' => $members->currentPage(),
            ],
        ]);
    }

    /**
     * Detail member beserta paket aktifnya
     */
    public function show(Request $request, string $id)
    {
        $member = Member::with(['homeBranch', 'memberships.plan'])->findOrFail($id);

        return ApiResponse::success(new MemberResource($member));
    }

    /**
     * Create Profil Member (Langkah 1)
     */
    public function store(StoreMemberRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('members/avatars', 'public');
        }

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            $data['password'] = Hash::make('password123');
        }

        $data['branch_id'] = $request->header('X-Branch-Id');

        $data['member_since'] = now()->toDateString();
        // Default inactive karena belum assign paket (membership)
        $data['status'] = 'inactive'; 

        $member = Member::create($data);
        $member->load('homeBranch');

        return ApiResponse::success(new MemberResource($member), 'Member profile created successfully', 201);
    }

    /**
     * Update Profil Member
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
        $member->load('homeBranch', 'memberships.plan');

        return ApiResponse::success(new MemberResource($member), 'Member updated successfully');
    }

    /**
     * Soft delete member
     */
    public function destroy(string $id)
    {
        $member = Member::findOrFail($id);

        // Cancel semua membership yang sedang aktif
        Membership::where('member_id', $member->id)->update(['status' => 'cancelled']);
        
        $member->update(['is_active' => false, 'status' => 'inactive']);
        $member->delete();

        return ApiResponse::success(null, 'Member deleted successfully');
    }

    // =============================================
    // MEMBERSHIP MANAGEMENT (Pembelian / Paket)
    // =============================================

    /**
     * Assign paket baru ke member (Langkah 2)
     */
    public function assignMembership(Request $request, string $id)
{
    $member = Member::findOrFail($id);

    $request->validate([
        'plan_id'    => ['required', 'uuid', 'exists:membership_plans,id'],
        'start_date' => ['nullable', 'date'],
        'started_at' => ['nullable', 'date'],
        'end_date'   => ['nullable', 'date'],
        'expires_at' => ['nullable', 'date'],
        'notes'      => ['nullable', 'string'],
    ]);

    $plan = MembershipPlan::findOrFail($request->plan_id);

    $startDate = $request->start_date ?? $request->started_at ?? now()->toDateString();
    $endDate   = $request->end_date ?? $request->expires_at;

    if (!$endDate) {
        $unit = match($plan->duration_unit) {
            'year'  => 'years',
            'month' => 'months',
            'week'  => 'weeks',
            default => 'days',
        };

        $endDate = \Carbon\Carbon::parse($startDate)
            ->add($plan->duration, $unit)
            ->toDateString();
    }

    $membership = Membership::create([
        'member_id'               => $member->id,
        'membership_plan_id'      => $plan->id, // ✅ FIX DISINI
        'home_branch_id'           => $request->header('X-Branch-Id'),
        'start_date'              => $startDate,
        'end_date'                => $endDate,
        'unlimited_checkin'       => $plan->unlimited_checkin ?? false,
        'remaining_checkin_quota' => $plan->checkin_quota_per_month ?? null,
        'status'                  => 'active',
        'notes'                   => $request->notes,
    ]);

    $this->syncMemberStatus($member->id);

    $membership->load('plan');

    return ApiResponse::success(
        new MembershipResource($membership),
        'Membership assigned successfully'
    );
}

    /**
     * Update status & masa berlaku membership (Extend, Freeze, dll)
     */
    public function updateMembership(Request $request, string $memberId, string $membershipId)
    {
        $request->validate([
            'status'       => ['nullable', 'in:active,expired,frozen,cancelled'],
            'end_date'     => ['nullable', 'date'],
            'frozen_until' => ['nullable', 'date', 'after:today'],
            'notes'        => ['nullable', 'string'],
        ]);

        $membership = Membership::where('member_id', $memberId)->findOrFail($membershipId);
        $updateData = [];

        if ($request->filled('status'))       $updateData['status']       = $request->status;
        if ($request->filled('end_date'))     $updateData['end_date']     = $request->end_date;
        if ($request->filled('frozen_until')) $updateData['frozen_until'] = $request->frozen_until;
        if ($request->has('notes'))           $updateData['notes']        = $request->notes;

        // Auto extend logic jika status diubah dari frozen menjadi active bisa ditambahkan disini
        // ...

        $membership->update($updateData);

        // Sync ulang status profil member
        $this->syncMemberStatus($memberId);

        return ApiResponse::success(new MembershipResource($membership->fresh('plan')), 'Membership updated');
    }

    /**
     * Batalkan/Hapus history paket
     */
    public function cancelMembership(string $memberId, string $membershipId)
    {
        $membership = Membership::where('member_id', $memberId)->findOrFail($membershipId);

        $membership->update(['status' => 'cancelled']);
        $membership->delete(); // Soft delete

        $this->syncMemberStatus($memberId);

        return ApiResponse::success(null, 'Membership cancelled successfully');
    }

    /**
     * List semua history paket milik member
     */
    public function memberships(string $id)
    {
        $member = Member::findOrFail($id);
        
        $memberships = $member->memberships()->with('plan')->orderByDesc('created_at')->get();

        return ApiResponse::success(MembershipResource::collection($memberships));
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================

    /**
     * Kalkulasi ulang status profil member berdasarkan paket yang dia miliki
     */
    private function syncMemberStatus(string $memberId): void
    {
        $member = Member::findOrFail($memberId);

        $hasActive = Membership::where('member_id', $memberId)
            ->where('status', 'active')
            ->where('end_date', '>=', now()->toDateString())
            ->exists();

        $hasFrozen = Membership::where('member_id', $memberId)
            ->where('status', 'frozen')
            ->exists();

        if ($hasActive) {
            $member->update(['status' => 'active']);
        } elseif ($hasFrozen) {
            $member->update(['status' => 'frozen']);
        } else {
            // Jika punya history expired, maka 'expired', jika tidak pernah punya paket maka 'inactive'
            $hasExpired = Membership::where('member_id', $memberId)->exists();
            $member->update(['status' => $hasExpired ? 'expired' : 'inactive']);
        }
    }
}