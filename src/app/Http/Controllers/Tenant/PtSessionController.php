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
     * List semua jadwal PT dengan filter
     */
    public function index(Request $request)
    {
        $query = PtSession::with(['member', 'trainer', 'package.plan']);

        // Filter berdasarkan tanggal (untuk Kalender atau List)
        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search berdasarkan nama member atau trainer
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('member', function($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%");
            })->orWhereHas('trainer', function($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%");
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
    public function show($id)
    {
        $session = PtSession::with(['member', 'trainer', 'package.plan', 'attendance'])->findOrFail($id);
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
            'date'          => 'required|date|after_or_equal:today',
            'start_at'      => 'required',
            'end_at'        => 'required|after:start_at',
        ]);

        $package = PtPackage::findOrFail($request->pt_package_id);

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

        $session = PtSession::create([
            'pt_package_id' => $package->id,
            'member_id'     => $package->member_id,
            'trainer_id'    => $request->trainer_id,
            'branch_id'     => $request->header('X-Branch-Id') ?? $package->branch_id,
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
        $session = PtSession::findOrFail($id);
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
        $session = PtSession::findOrFail($id);

        if ($session->status === 'completed') {
            return ApiResponse::error("Sesi yang sudah selesai tidak dapat dibatalkan.", null, 422);
        }

        $session->update([
            'status'           => 'cancelled',
            'cancelled_reason' => $request->cancelled_reason,
        ]);

        return ApiResponse::success(null, 'Jadwal berhasil dibatalkan');
    }
}