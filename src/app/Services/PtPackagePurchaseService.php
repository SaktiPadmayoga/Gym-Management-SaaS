<?php

namespace App\Services;

use App\Models\Tenant\Member;
use App\Models\Tenant\PtSessionPlan;
use App\Models\Tenant\PtPackage;
use App\Models\Tenant\TenantInvoice;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PtPackagePurchaseService
{
    public function __construct(
        protected MidtransService $midtrans
    ) {}

    /**
     * Entry point untuk membeli paket PT.
     */
    public function purchase(PtSessionPlan $plan, Member $member, string $branchId): array
    {
        return DB::transaction(function () use ($plan, $member, $branchId) {
            
            // 1. Buat Invoice
            $invoice = TenantInvoice::create([
                'tenant_id'       => tenant('id'),
                'member_id'       => $member->id,
                'branch_id'       => $branchId,
                'invoice_number'  => TenantInvoice::generateInvoiceNumber('PTP'),
                'subtotal'        => $plan->price,
                'tax'             => 0,
                'total_amount'    => $plan->price,
                'currency'        => $plan->currency ?? 'IDR',
                'payment_gateway' => 'midtrans',
                'status'          => 'pending',
                'issued_at'       => now(),
                'due_date'        => now()->addHours(24), // Waktu bayar 24 jam
            ]);

            // 2. Buat Invoice Item (polymorphic)
            $invoice->items()->create([
                'item_type'   => PtSessionPlan::class,
                'item_id'     => $plan->id,
                'item_name'   => "PT Package: {$plan->name} ({$plan->total_sessions} Sessions)",
                'quantity'    => 1,
                'unit_price'  => $plan->price,
                'total_price' => $plan->price,
            ]);

            // 3. Buat PT Package dengan status pending
            $ptPackage = PtPackage::create([
                'member_id'          => $member->id,
                'pt_session_plan_id' => $plan->id,
                'tenant_invoice_id'  => $invoice->id,
                'branch_id'          => $branchId,
                'total_sessions'     => $plan->total_sessions,
                'used_sessions'      => 0,
                'status'             => 'pending',
                'purchased_at'       => now(),
                // activated_at dan expired_at akan diisi setelah lunas
            ]);

            // 4. Update external_reference di Invoice
            $invoice->update([
                'external_reference' => $invoice->invoice_number,
            ]);

            // 5. Minta Snap Token ke Midtrans
            $snapToken = $this->midtrans->getSnapToken(
                orderId:     $invoice->invoice_number,
                grossAmount: (int) $plan->price,
                member:      $member,
                plan:        $plan, // Opsional, sesuaikan parameter method getSnapToken kamu
            );

            return [
                'package'    => $ptPackage,
                'invoice'    => $invoice->fresh(['items']),
                'snap_token' => $snapToken,
            ];
        });
    }
}