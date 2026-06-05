<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\PtSession;
use App\Models\Tenant\PtPackage;
use App\Http\Resources\Tenant\PtSessionResource; // Buat resource jika diperlukan
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PtSessionController extends Controller
{
    /**
     * Helper to get base query with branch scoping for non-owners/admins
     */
    private function getPtSessionQuery(Request $request)
    {
        $query = PtSession::query();
        $staff = $request->user();

        if ($staff && !$staff->isOwner() && $staff->role !== 'admin') {
            $activeBranchId = $request->header('X-Branch-Id');
            $query->where('branch_id', $activeBranchId);
        }

        return $query;
    }

    /**
     * List semua jadwal PT dengan filter
     */
    public function index(Request $request)
    {
        $staff = $request->user();
        $query = $this->getPtSessionQuery($request)->with(['member', 'trainer', 'package.plan']);

        // Filter branch for global managers (owner/admin)
        if ($staff && ($staff->isOwner() || $staff->role === 'admin')) {
            if ($request->filled('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            } elseif ($branchId = $request->header('X-Branch-Id')) {
                $query->where('branch_id', $branchId);
            }
        }

        // Filter: Trainer hanya melihat sesinya sendiri, kecuali dia manager/owner
        $isBranchTrainer = $staff->staffBranches()->whereHas('role', fn($q) => $q->where('name', 'trainer'))->exists();
        $isManager = $staff->role === 'owner' || $staff->role === 'admin' || $staff->staffBranches()->whereHas('role', fn($q) => $q->whereIn('name', ['branch_manager']))->exists();

        if ($isBranchTrainer && !$isManager) {
            $query->where('trainer_id', $staff->id);
        }

        // Filter berdasarkan tanggal (untuk Kalender atau List)
        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search berdasarkan nama member atau trainer (nested where to prevent OR clause bypass)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('member', function($qm) use ($search) {
                    $qm->where('name', 'ilike', "%{$search}%");
                })->orWhereHas('trainer', function($qt) use ($search) {
                    $qt->where('name', 'ilike', "%{$search}%");
                });
            });
        }

        $sessions = $query->orderBy('date', 'desc')
                          ->orderBy('start_at', 'asc')
                          ->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'data' => $sessions->items(),
            'meta' => [
                'total'        => $sessions->total(),
                'per_page'     => $sessions->perPage(),
                'current_page' => $sessions->currentPage(),
                'last_page'    => $sessions->lastPage(),
            ],
        ]);
    }

    /**
     * Detail Jadwal
     */
    public function show(Request $request, $id)
    {
        $session = $this->getPtSessionQuery($request)->with(['member', 'trainer', 'package.plan', 'attendance'])->findOrFail($id);
        return ApiResponse::success($session);
    }

    /**
     * Buat Jadwal Baru (Pengecekan Kuota)
     */
    public function store(Request $request)
    {
        $request->validate([
            'pt_package_id' => 'required|uuid|exists:pt_packages,id',
            'trainer_id'    => 'required|uuid',
            'date'          => 'required|date',
            'start_at'      => 'required',
            'end_at'        => 'required|after:start_at',
        ]);

        $staff = $request->user();
        $packageQuery = PtPackage::query();
        if ($staff && !$staff->isOwner() && $staff->role !== 'admin') {
            $packageQuery->where('branch_id', $request->header('X-Branch-Id'));
        }
        $package = $packageQuery->findOrFail($request->pt_package_id);

        // 1. Pastikan paket aktif
        if ($package->status !== 'active') {
            return ApiResponse::error("Paket ini sedang {$package->status}. Hanya paket 'active' yang bisa dijadwalkan.", null, 422);
        }

        // 2. Cek Kuota (Rumus: Sisa = Total - (Selesai + Terjadwal))
        $scheduledCount = PtSession::where('pt_package_id', $package->id)
            ->whereIn('status', ['scheduled', 'ongoing'])
            ->count();

        if (($package->used_sessions + $scheduledCount) >= $package->total_sessions) {
            return ApiResponse::error("Kuota paket tidak mencukupi untuk membuat jadwal baru.", null, 422);
        }

        $branchId = $request->header('X-Branch-Id') ?? $package->branch_id;
        if (empty($branchId)) {
            return ApiResponse::error("Cabang tidak terdeteksi. Silakan pilih cabang Anda terlebih dahulu.", null, 422);
        }

        $session = PtSession::create([
            'pt_package_id' => $package->id,
            'member_id'     => $package->member_id,
            'trainer_id'    => $request->trainer_id,
            'branch_id'     => $branchId,
            'date'          => $request->date,
            'start_at'      => $request->start_at,
            'end_at'        => $request->end_at,
            'status'        => 'scheduled',
            'notes'         => $request->notes,
        ]);

        return ApiResponse::success($session->load('member', 'trainer'), 'Jadwal PT berhasil dibuat', 201);
    }

    /**
     * Update Jadwal
     */
    public function update(Request $request, $id)
    {
        $session = $this->getPtSessionQuery($request)->findOrFail($id);
        $session->update($request->only(['date', 'start_at', 'end_at', 'trainer_id', 'status', 'notes']));

        // Jika status diubah menjadi completed, jangan lupa update used_sessions di package
        // Namun idealnya ini dilakukan di method khusus 'check-in' agar lebih terkontrol
        
        return ApiResponse::success($session, 'Jadwal berhasil diperbarui');
    }

    /**
     * Batalkan Jadwal
     */
    public function cancel(Request $request, $id)
    {
        $session = $this->getPtSessionQuery($request)->findOrFail($id);

        if ($session->status === 'completed') {
            return ApiResponse::error("Sesi yang sudah selesai tidak dapat dibatalkan.", null, 422);
        }

        $session->update([
            'status'           => 'cancelled',
            'cancelled_reason' => $request->cancelled_reason,
        ]);

        return ApiResponse::success(null, 'Jadwal berhasil dibatalkan');
    }

    /**
     * Tandai Sesi Sebagai Selesai
     * Sekaligus update used_sessions di paket member.
     */
    public function markComplete(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:2000',
        ]);

        $session = $this->getPtSessionQuery($request)->with('package')->findOrFail($id);

        if (!in_array($session->status, ['scheduled', 'ongoing'])) {
            return ApiResponse::error(
                "Hanya sesi berstatus 'scheduled' atau 'ongoing' yang bisa diselesaikan.",
                null, 422
            );
        }

        DB::transaction(function () use ($session, $request) {
            // 1. Update status sesi + simpan catatan trainer
            $session->update([
                'status' => 'completed',
                'notes'  => $request->notes,
            ]);

            // 2. Increment used_sessions di paket (fix bug TODO sebelumnya)
            if ($session->package) {
                $session->package->increment('used_sessions');
            }
        });

        return ApiResponse::success(
            $session->fresh(['member', 'trainer', 'package.plan']),
            'Sesi berhasil ditandai selesai'
        );
    }

    /**
     * Update Catatan/Progress Sesi (oleh Trainer)
     * Hanya bisa mengedit kolom notes saja.
     */
    public function updateNotes(Request $request, $id)
    {
        $request->validate([
            'notes' => 'required|string|max:2000',
        ]);

        $staff   = $request->user();
        $session = $this->getPtSessionQuery($request)->findOrFail($id);

        // Trainer hanya boleh edit notes sesi yang dia ampu,
        // kecuali owner/admin yang bisa edit semuanya.
        if (!$staff->isOwner() && $staff->role !== 'admin') {
            if ($session->trainer_id !== $staff->id) {
                return ApiResponse::error('Anda tidak berhak mengedit catatan sesi ini.', null, 403);
            }
        }

        $session->update(['notes' => $request->notes]);

        return ApiResponse::success($session->fresh(), 'Catatan sesi berhasil diperbarui');
    }

    public function getRequests(Request $request)
    {
        $staff = $request->user();
        $query = $this->getPtSessionQuery($request)->with(['member:id,name', 'package.plan'])
            ->where('status', 'requested');

        // Filter branch for global managers (owner/admin)
        if ($staff && ($staff->isOwner() || $staff->role === 'admin')) {
            if ($request->filled('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            } elseif ($branchId = $request->header('X-Branch-Id')) {
                $query->where('branch_id', $branchId);
            }
        }

        // Filter: Trainer hanya melihat request untuk dirinya sendiri,
        // Branch manager bisa melihat semua request di cabang mereka.
        $isGlobalTrainer = $staff->role === 'trainer';
        $isBranchTrainer = $staff->staffBranches()->whereHas('role', fn($q) => $q->where('name', 'trainer'))->exists();
        $isManager = $staff->role === 'owner' || $staff->role === 'admin' || $staff->staffBranches()->whereHas('role', fn($q) => $q->whereIn('name', ['branch_manager']))->exists();

        if (($isGlobalTrainer || $isBranchTrainer) && !$isManager) {
            $query->where('trainer_id', $staff->id);
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'data' => $requests->items(),
            'meta' => [
                'total'        => $requests->total(),
                'per_page'     => $requests->perPage(),
                'current_page' => $requests->currentPage(),
            ]
        ], 'Daftar request PT berhasil diambil');
    }

    public function approveRequest(Request $request, $id)
    {
        $session = $this->getPtSessionQuery($request)->findOrFail($id);
        
        if ($session->status !== 'requested') {
            return ApiResponse::error('Sesi ini tidak dalam status requested', null, 400);
        }

        $session->update([
            'status' => 'scheduled'
        ]);

        // Kirim notifikasi ke member (bisa melalui table notifications terpisah untuk member jika ada, 
        // atau kita gunakan logger/email untuk sementara).
        Log::info("PT Session {$id} approved for member {$session->member_id}");

        return ApiResponse::success($session, 'Request berhasil diterima menjadi scheduled');
    }

    public function rejectRequest(Request $request, $id)
    {
        $request->validate([
            'cancelled_reason' => 'required|string|max:255'
        ]);

        $session = $this->getPtSessionQuery($request)->findOrFail($id);
        
        if ($session->status !== 'requested') {
            return ApiResponse::error('Sesi ini tidak dalam status requested', null, 400);
        }

        $session->update([
            'status' => 'rejected',
            'cancelled_reason' => $request->cancelled_reason
        ]);

        Log::info("PT Session {$id} rejected for member {$session->member_id}. Reason: {$request->cancelled_reason}");

        return ApiResponse::success($session, 'Request berhasil ditolak');
    }
}