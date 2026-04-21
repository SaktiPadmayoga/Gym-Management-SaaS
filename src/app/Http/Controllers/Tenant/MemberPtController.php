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

    /**
     * GET /api/tenant/member/pt-plans
     * Katalog paket PT yang bisa dibeli member.
     */
    public function availablePlans(Request $request)
    {
        $query = PtSessionPlan::where('is_active', true);

        // Filter berdasarkan cabang (jika plan spesifik untuk cabang tertentu)
        if ($branchId = $request->header('X-Branch-Id')) {
            $query->where(function($q) use ($branchId) {
                $q->whereNull('branch_id')->orWhere('branch_id', $branchId);
            });
        }

        $plans = $query->orderBy('sort_order')->get();

        return ApiResponse::success($plans, 'Katalog PT Plan berhasil diambil');
    }

    /**
     * POST /api/tenant/member/pt-packages/purchase
     * Member membeli paket PT.
     */
    public function purchase(Request $request)
    {
        $request->validate([
            'pt_session_plan_id' => ['required', 'uuid', 'exists:pt_session_plans,id'],
        ]);

        $plan = PtSessionPlan::findOrFail($request->pt_session_plan_id);
        
        // 1. Pastikan memanggil auth guard member agar object member tidak null
        $member = auth('member')->user(); 

        // 2. Ambil nilai header
        $branchId = $request->header('X-Branch-Id');

        // 3. Gunakan fungsi empty(), karena empty() mendeteksi null DAN string kosong ("")
        if (empty($branchId)) {
            $branchId = $member->home_branch_id ?? $member->branch_id;
        }

        // 4. Validasi akhir
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

    /**
     * GET /api/tenant/member/my-pt-packages
     * Member melihat daftar paket yang mereka miliki (aktif, pending, dsb).
     */
    public function myPackages(Request $request)
    {
        $member = $request->user();

        $packages = PtPackage::with(['plan', 'invoice:id,status,invoice_number'])
            ->where('member_id', $member->id)
            // Ganti bagian orderByRaw menjadi CASE statement untuk PostgreSQL
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
}