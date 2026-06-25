<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\PtSessionPlan;
use App\Models\Tenant\PtPackage;
use App\Services\PtPackagePurchaseService;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MemberPtController extends Controller
{
    public function __construct(
        protected PtPackagePurchaseService $purchaseService
    ) {}


    public function availablePlans(Request $request)
    {
        $query = PtSessionPlan::where('is_active', true);

        if ($branchId = $request->header('X-Branch-Id')) {
            $query->where(function($q) use ($branchId) {
                $q->whereNull('branch_id')->orWhere('branch_id', $branchId);
            });
        }

        $plans = $query->orderBy('sort_order')->get();

        return ApiResponse::success($plans, 'Katalog PT Plan berhasil diambil');
    }


    public function purchase(Request $request)
    {
        $request->validate([
            'pt_session_plan_id' => ['required', 'uuid', 'exists:pt_session_plans,id'],
        ]);

        $plan = PtSessionPlan::findOrFail($request->pt_session_plan_id);
        
        $member = auth('member')->user(); 

        $branchId = $request->header('X-Branch-Id');

        if (empty($branchId)) {
            $branchId = $member->home_branch_id ?? $member->branch_id;
        }
        if (empty($branchId)) {
            return ApiResponse::error('Cabang tidak ditentukan. Member tidak memiliki Home Branch.', null, 400);
        }

        try {
            $result = $this->purchaseService->purchase($plan, $member, $branchId);

            return ApiResponse::success([
                'package'    => $result['package'],
                'invoice'    => [
                    'id'             => $result['invoice']->id,
                    'invoice_number' => $result['invoice']->invoice_number,
                    'total_amount'   => $result['invoice']->total_amount,
                    'due_date'       => $result['invoice']->due_date,
                ],
                'snap_token' => $result['snap_token'],
            ], 'Silakan selesaikan pembayaran', 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('[MemberPtController] Gagal beli paket', [
                'member_id' => $member->id ?? 'null',
                'plan_id'   => $plan->id,
                'error'     => $e->getMessage()
            ]);
            return ApiResponse::error('Gagal memproses pembelian. Coba beberapa saat lagi.', null, 500);
        }
    }

    public function myPackages(Request $request)
    {
        $member = $request->user();

        $packages = PtPackage::with(['plan', 'invoice:id,status,invoice_number'])
            ->where('member_id', $member->id)
            ->orderByRaw("
                CASE status 
                    WHEN 'active' THEN 1 
                    WHEN 'pending' THEN 2 
                    WHEN 'completed' THEN 3 
                    WHEN 'expired' THEN 4 
                    WHEN 'cancelled' THEN 5 
                    ELSE 6 
                END
            ")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($package) {
                $packageArray = $package->toArray();
                $packageArray['remaining_sessions'] = $package->remaining_sessions;
                return $packageArray;
            });

        return ApiResponse::success($packages, 'Daftar paket PT berhasil diambil');
    }


    public function mySessions(Request $request)
    {
        $member = $request->user();

        $sessions = \App\Models\Tenant\PtSession::with(['package.plan', 'trainer:id,name', 'branch:id,name'])
            ->where('member_id', $member->id)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->date, fn($q) => $q->whereDate('date', $request->date))
            ->orderBy('date', 'desc')
            ->orderBy('start_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return ApiResponse::success([
            'data' => $sessions->items(),
            'meta' => [
                'total'         => $sessions->total(),
                'per_page'      => $sessions->perPage(),
                'current_page'  => $sessions->currentPage(),
                'next_page_url' => $sessions->nextPageUrl(),
                'prev_page_url' => $sessions->previousPageUrl(),
            ],
        ], 'Daftar sesi PT berhasil diambil');
    }
    
    public function getTrainers(Request $request)
    {
        $branchId = $request->header('X-Branch-Id');

        $query = \App\Models\Tenant\Staff::where('is_active', true)
            ->where(function($q) use ($branchId) {
                $q->where('role', 'trainer')
                  ->orWhereHas('staffBranches', function($qb) use ($branchId) {
                      $qb->whereHas('role', fn($r) => $r->where('name', 'trainer'));
                      if ($branchId) {
                          $qb->where('branch_id', $branchId);
                      }
                  });
            });

        return ApiResponse::success($query->get(['id', 'name']), 'Daftar pelatih berhasil diambil');
    }

    public function getTrainerBookedSlots(Request $request, $trainerId)
    {
        $date = $request->get('date');
        if (!$date) return ApiResponse::error('Date is required', null, 400);

        $sessions = \App\Models\Tenant\PtSession::where('trainer_id', $trainerId)
            ->where('date', $date)
            ->whereIn('status', ['scheduled', 'ongoing', 'requested'])
            ->get(['start_at', 'end_at']);

        return ApiResponse::success($sessions, 'Slot pelatih berhasil diambil');
    }

    public function requestSession(Request $request)
    {
        $request->validate([
            'pt_package_id' => 'required|uuid|exists:pt_packages,id',
            'trainer_id'    => 'required|uuid|exists:staffs,id',
            'date'          => 'required|date|after_or_equal:today',
            'start_at'      => 'required|date_format:H:i',
            'end_at'        => 'required|date_format:H:i|after:start_at',
            'notes'         => 'nullable|string|max:500',
        ]);

        $member = $request->user();
        
        $package = PtPackage::where('id', $request->pt_package_id)
            ->where('member_id', $member->id)
            ->where('status', 'active')
            ->first();

        if (!$package) {
            return ApiResponse::error('Paket PT tidak valid atau tidak aktif', null, 400);
        }

        if ($package->remaining_sessions <= 0) {
            return ApiResponse::error('Kuota paket PT Anda sudah habis', null, 400);
        }

        // Cek bentrok jadwal
        $overlap = \App\Models\Tenant\PtSession::where('trainer_id', $request->trainer_id)
            ->where('date', $request->date)
            ->whereIn('status', ['scheduled', 'ongoing', 'requested'])
            ->where(function($q) use ($request) {
                $q->where(function($q2) use ($request) {
                    $q2->where('start_at', '<', $request->end_at)
                       ->where('end_at', '>', $request->start_at);
                });
            })
            ->exists();

        if ($overlap) {
            return ApiResponse::error('Pelatih sudah memiliki jadwal atau request lain di jam tersebut', null, 400);
        }

        $session = \App\Models\Tenant\PtSession::create([
            'pt_package_id' => $package->id,
            'member_id'     => $member->id,
            'trainer_id'    => $request->trainer_id,
            'branch_id'     => $package->branch_id ?? $member->home_branch_id,
            'date'          => $request->date,
            'start_at'      => $request->start_at,
            'end_at'        => $request->end_at,
            'status'        => 'requested',
            'notes'         => $request->notes,
        ]);

        // Kirim Notifikasi
        \App\Models\Tenant\TenantNotification::create([
            'id'        => (string) \Illuminate\Support\Str::uuid(),
            'branch_id' => $package->branch_id ?? $member->home_branch_id,
            'staff_id'  => $request->trainer_id, // Untuk pelatih terkait
            'type'      => 'pt_request',
            'title'     => 'Request Jadwal PT Baru',
            'message'   => "Member {$member->name} request jadwal PT pada {$request->date} jam {$request->start_at}.",
            'is_read'   => false,
        ]);

        return ApiResponse::success($session, 'Request jadwal berhasil dikirim', 201);
    }
}