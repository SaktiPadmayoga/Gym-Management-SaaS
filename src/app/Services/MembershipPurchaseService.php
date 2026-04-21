<?php

namespace App\Services;

use App\Models\Tenant\Member;
use App\Models\Tenant\Membership;
use App\Models\Tenant\MembershipPlan;
use App\Models\Tenant\TenantInvoice;
use App\Models\Tenant\TenantPayment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MembershipPurchaseService
{
    public function __construct(protected MidtransService $midtrans) {}

    /**
     * Saya tambahkan parameter default $prefix = 'UPG' 
     * agar bisa dipakai untuk registrasi ('MEM') maupun upgrade ('UPG')
     */
    public function purchase(Member $member, MembershipPlan $plan, string $branchId, ?string $notes = null, string $paymentMethod = 'midtrans', string $prefix = 'UPG'): array
    {
        $isCash = $paymentMethod === 'cash';
        $isFree = $plan->price <= 0;

        return DB::transaction(function () use ($member, $plan, $branchId, $notes, $paymentMethod, $isCash, $isFree, $prefix) {
            
            // 1. Tentukan Masa Berlaku (Start & End Date)
            $startDate = now();
            $endDate   = $plan->getEndDate($startDate);
            // 2. Buat Invoice Jika Berbayar
            $invoice = null;
            if (!$isFree) {
                $invoice = TenantInvoice::create([
                    'tenant_id'       => tenant('id'),
                    'member_id'       => $member->id,
                    'branch_id'       => $branchId,
                    'invoice_number'  => TenantInvoice::generateInvoiceNumber($prefix), 
                    'subtotal'        => $plan->price,
                    'total_amount'    => $plan->price,
                    'currency'        => 'IDR',
                    'payment_gateway' => $paymentMethod,
                    'status'          => $isCash ? 'paid' : 'pending',
                    'issued_at'       => now(),
                    'due_date'        => now()->addHours(24),
                    'paid_at'         => $isCash ? now() : null,
                ]);

                // Item Pembelian
                $invoice->items()->create([
                    'item_type'  => MembershipPlan::class,
                    'item_id'    => $plan->id,
                    'item_name'  => "Paket Membership: {$plan->name}",
                    'quantity'   => 1,
                    'unit_price' => $plan->price,
                    'total_price'=> $plan->price,
                ]);

                $invoice->update(['external_reference' => $invoice->invoice_number]);

                // Jika Cash, langsung buat TenantPayment
                if ($isCash) {
                    TenantPayment::create([
                        'tenant_invoice_id' => $invoice->id,
                        'provider'          => 'manual',
                        'payment_type'      => 'cash',
                        'order_id'          => $invoice->invoice_number,
                        'gross_amount'      => $plan->price,
                        'status'            => 'success',
                        'paid_at'           => now(),
                    ]);
                }
            }

            // 3. Buat Data Membership Baru
            $membership = Membership::create([
                'member_id'               => $member->id,
                'membership_plan_id'      => $plan->id,
                'branch_id'               => $branchId,
                'tenant_invoice_id'       => $invoice ? $invoice->id : null,
                'start_date'              => $startDate,
                'end_date'                => $endDate,
                'status'                  => ($isFree || $isCash) ? 'active' : 'pending',
                'unlimited_checkin'       => $plan->unlimited_checkin ?? true,
                'remaining_checkin_quota' => $plan->checkin_quota ?? null,
                'notes'                   => $notes,
            ]);

            Log::info('Membership created', [
                'membership_id' => $membership->id,
                'invoice_id' => $invoice?->id
            ]);

            // 4. Jika Cash atau Free, eksekusi aktifasi dan batalkan paket lama seketika
            if ($isFree || $isCash) {
                // Batalkan paket lama
                Membership::where('member_id', $member->id)
                    ->where('id', '!=', $membership->id)
                    ->whereIn('status', ['active', 'pending', 'trial'])
                    ->update([
                        'status' => 'cancelled',
                        'notes'  => 'Dibatalkan otomatis karena pembelian/upgrade paket tunai/gratis.'
                    ]);

                // Aktifkan Member
                $member->update([
                    'status'         => 'active',
                    'home_branch_id' => $member->home_branch_id ?? $branchId,
                    'member_since'   => $member->member_since ?? now()->toDateString()
                ]);

                return ['membership' => $membership, 'invoice' => $invoice, 'snap_token' => null];
            }

            // 5. Jika Midtrans, Minta Snap Token
            $snapToken = $this->midtrans->getSnapToken(
                orderId:     $invoice->invoice_number,
                grossAmount: (int) $plan->price,
                member:      $member,
                plan:        $plan
            );

            return ['membership' => $membership, 'invoice' => $invoice, 'snap_token' => $snapToken];
        });
    }
}