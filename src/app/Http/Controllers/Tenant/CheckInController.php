<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreCheckInRequest;
use App\Http\Resources\Tenant\CheckInResource;
use App\Http\Responses\ApiResponse;
use App\Models\Tenant\CheckIn;
use App\Models\Tenant\Member;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Request;


class CheckInController extends Controller
{

    public function index(Request $request)
    {
        $query = CheckIn::with(['member', 'membership.plan', 'branch'])
            ->latest('checked_in_at');

        if ($request->search) {
            $query->whereHas('member', fn($q) => 
                $q->where('name', 'ilike', "%{$request->search}%")
            );
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date) {
            $query->whereDate('checked_in_at', $request->date);
        } else {
            // Default: hari ini
            $query->whereDate('checked_in_at', today());
        }

        $data = $query->paginate($request->per_page ?? 15);

        return ApiResponse::success(CheckInResource::collection($data)->response()->getData());
    }

    public function store(StoreCheckInRequest $request)
    {
        $qrToken = $request->validated('qr_token');
        $branchId = $request->validated('branch_id');

        $member = Member::where('qr_token', $qrToken)->first();

        if (!$member) {
            $this->recordFailedCheckIn($member, $branchId, "QR Code tidak valid atau sudah kadaluarsa.");
            return ApiResponse::error('QR Code tidak valid. Silakan refresh aplikasi member.', null, 404);
        }

        if (!$member->is_active) {
            $this->recordFailedCheckIn($member, $branchId, "Status member tidak aktif.");
            return ApiResponse::error('Akun member Anda sedang tidak aktif. Hubungi resepsionis.', null, 403);
        }

        $membership = $member->activeMembership;

        if (!$membership) {
            $this->recordFailedCheckIn($member, $branchId, "Tidak memiliki paket aktif.");
            return ApiResponse::error('Anda tidak memiliki paket aktif. Silakan lakukan perpanjangan.', null, 403);
        }

        if ($membership->isExpired()) {
            $this->recordFailedCheckIn($member, $branchId, "Paket expired.", $membership->id);
            return ApiResponse::error('Paket Anda sudah berakhir. Silakan perpanjang paket Anda.', null, 403);
        }

        if ($membership->isFrozen()) {
            $this->recordFailedCheckIn($member, $branchId, "Paket sedang di-freeze.", $membership->id);
            return ApiResponse::error('Paket Anda sedang dalam masa pembekuan (Freeze).', null, 403);
        }

        $plan = $membership->plan;
        $hasBranchAccess = false;

        if (is_null($plan->branch_id)) {
            $hasBranchAccess = true;
        } elseif ($plan->access_type === 'single_branch') {
            $hasBranchAccess = ($plan->branch_id === $branchId);
        } elseif ($plan->access_type === 'cross_branch') {
            $hasBranchAccess = DB::table('plan_branch_access')
                ->where('plan_id', $plan->id)
                ->where('branch_id', $branchId)
                ->exists();
        }

        if (!$hasBranchAccess) {
            $this->recordFailedCheckIn($member, $branchId, "Paket tidak berlaku di cabang ini.", $membership->id);
            return ApiResponse::error('Maaf, paket Anda tidak mengizinkan akses ke cabang ini.', null, 403);
        }

        if (!$membership->hasCheckinQuota()) {
            $this->recordFailedCheckIn($member, $branchId, "Kuota habis.", $membership->id);
            return ApiResponse::error('Kuota kunjungan Anda sudah habis. Silakan beli paket baru.', null, 403);
        }

        try {
            DB::beginTransaction();

            if (!$membership->unlimited_checkin) {
                $membership->decrement('remaining_checkin_quota');
            }
            $membership->increment('total_checkins');

            $member->update([
                'last_checkin_at' => now(),
                'qr_token'        => (string) Str::uuid(), 
            ]);

            $checkIn = CheckIn::create([
                'member_id'     => $member->id,
                'branch_id'     => $branchId,
                'membership_id' => $membership->id,
                'checked_in_at' => now(),
                'status'        => 'success',
                'notes'         => 'Check-in berhasil via QR',
            ]);

            DB::commit();

            $checkIn->load(['member', 'membership.plan', 'branch']);

            $message = 'Selamat latihan, ' . $member->name . '!';
            if (!$membership->unlimited_checkin) {
                $message .= ' (Sisa kuota: ' . $membership->remaining_checkin_quota . ')';
            }

            return ApiResponse::success(new CheckInResource($checkIn), $message, null, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Terjadi kesalahan sistem saat memproses check-in.', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    /**
     * Helper untuk mencatat percobaan check-in yang gagal.
     * Berguna untuk statistik Owner melihat percobaan penerobosan/member expired.
     */
    private function recordFailedCheckIn(?Member $member, string $branchId, string $notes, ?string $membershipId = null)
    {
        if ($member) {
            CheckIn::create([
                'member_id'     => $member->id,
                'branch_id'     => $branchId,
                'membership_id' => $membershipId,
                'checked_in_at' => now(),
                'status'        => 'failed',
                'notes'         => $notes,
            ]);
        }
    }
}