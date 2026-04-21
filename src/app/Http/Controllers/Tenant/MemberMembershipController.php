<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\MembershipPlan;
use App\Services\MembershipPurchaseService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class MemberMembershipController extends Controller
{
    public function upgrade(Request $request, MembershipPurchaseService $purchaseService): JsonResponse
    {
        $request->validate([
            'membership_plan_id' => 'required|uuid|exists:membership_plans,id',
            // Opsional: Jika member bisa memilih mau aktif di cabang mana
            'branch_id'          => 'nullable|uuid|exists:branches,id', 
        ]);

        try {
            // Ambil data member yang sedang login
            /** @var \App\Models\Tenant\Member $member */
            $member = Auth::guard('member')->user(); 
            $plan   = MembershipPlan::findOrFail($request->membership_plan_id);

            // Ambil branch_id dari Membership aktif, BUKAN dari tabel member
            $activeMembership = $member->activeMembership; // Sesuaikan dengan nama relasi di model Member kamu
            $branchId = $request->branch_id ?? $activeMembership?->branch_id;

            if (!$branchId) {
                return response()->json(['message' => 'Silakan pilih cabang terlebih dahulu.'], 422);
            }

            // Panggil Service yang SAMA PERSIS dengan yang dipakai POS Kasir
            // Paksakan payment_method = 'midtrans' karena ini dari aplikasi member
            $result = $purchaseService->purchase(
                member: $member,
                plan: $plan,
                branchId: $branchId,
                notes: 'Upgrade via Member Dashboard',
                paymentMethod: 'midtrans'
            );

            return response()->json([
                'success' => true,
                'message' => 'Silakan selesaikan pembayaran.',
                'data'    => [
                    'invoice_number' => $result['invoice']->invoice_number,
                    'snap_token'     => $result['snap_token'],
                ]
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('[MemberUpgrade] Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal memproses upgrade membership.'], 500);
        }
    }
}