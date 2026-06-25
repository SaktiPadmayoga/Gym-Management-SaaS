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
            'branch_id'          => 'nullable|uuid|exists:branches,id', 
        ]);

        try {
            /** @var \App\Models\Tenant\Member $member */
            $member = Auth::guard('member')->user(); 
            $plan   = MembershipPlan::findOrFail($request->membership_plan_id);

            $activeMembership = $member->activeMembership;
            $branchId = $request->branch_id ?? $activeMembership?->branch_id;

            if (!$branchId) {
                return response()->json(['message' => 'Silakan pilih cabang terlebih dahulu.'], 422);
            }

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