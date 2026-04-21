<?php

namespace App\Services;

use App\Models\Tenant\TenantInvoice;
use App\Models\Tenant\TenantPayment;
use App\Models\Tenant\Membership;
use App\Models\Tenant\Member;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MembershipPaymentService
{
    /**
     * Konfirmasi pembayaran sukses dari Webhook
     */
    public function confirmPayment(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? null;
        if (!$orderId) return false;

        $invoice = TenantInvoice::where('invoice_number', $orderId)->first();
        
        if (!$invoice || (method_exists($invoice, 'isPaid') ? $invoice->isPaid() : $invoice->status === 'paid')) {
            return false;
        }

        $membershipBaru = Membership::where('tenant_invoice_id', $invoice->id)->first();

        if (!$membershipBaru) {
            Log::error('[MembershipPayment] Membership tidak ditemukan untuk invoice', ['invoice_id' => $invoice->id]);
            return false;
        }

        DB::transaction(function () use ($invoice, $membershipBaru, $payload) {
            
            // 1. Update Invoice (Gunakan $payload langsung seperti PT Package)
            $invoice->update([
                'status'           => 'paid',
                'payment_method'   => $payload['payment_type'] ?? 'midtrans',
                'transaction_id'   => $payload['transaction_id'] ?? null,
                'paid_at'          => now(),
                'gateway_response' => $payload 
            ]);

            // 2. Buat Catatan di TenantPayment (Format persis PT Package)
            TenantPayment::create([
                'tenant_invoice_id' => $invoice->id,
                'provider'          => 'midtrans',
                'payment_type'      => $payload['payment_type'] ?? null,
                'transaction_id'    => $payload['transaction_id'] ?? null,
                'order_id'          => $payload['order_id'],
                'gross_amount'      => $payload['gross_amount'],
                'status'            => 'success',
                'raw_response'      => $payload,
                'paid_at'           => now(),
            ]);

            // 3. Auto-Cancel Membership Lama Milik Member Ini
            Membership::where('member_id', $membershipBaru->member_id)
                ->where('id', '!=', $membershipBaru->id)
                ->whereIn('status', ['active', 'pending', 'trial'])
                ->update([
                    'status' => 'cancelled',
                    'notes'  => "Dibatalkan otomatis karena upgrade/pembelian paket baru (Invoice: {$invoice->invoice_number})"
                ]);

            // 4. Aktifkan Membership Baru
            $membershipBaru->load('plan');
            $membershipBaru->activate();
            
            // 5. Aktifkan Member & Set Home Branch
            $member = Member::find($membershipBaru->member_id);
            if ($member) {
                $member->update([
                    'status'         => 'active',
                    'home_branch_id' => $member->home_branch_id ?? $membershipBaru->branch_id,
                    'member_since'   => $member->member_since ?? now()->toDateString()
                ]);
            }
            
            Log::info('[MembershipPayment] Berhasil mengaktifkan membership dan mencatat TenantPayment', ['membership_id' => $membershipBaru->id]);
        });

        return true;
    }

    /**
     * Handle pembayaran gagal/expired
     */
    public function handleFailedPayment(array $payload, string $paymentStatus): void
    {
        $orderId = $payload['order_id'] ?? null;
        if (!$orderId) return;

        $invoice = TenantInvoice::where('invoice_number', $orderId)->first();
        if (!$invoice || (method_exists($invoice, 'isPaid') ? $invoice->isPaid() : $invoice->status === 'paid')) {
            return;
        }

        DB::transaction(function () use ($invoice, $payload, $paymentStatus) {
            
            $invoiceStatus = ($paymentStatus === 'expired') ? 'expired' : 'failed';
            $invoice->update([
                'status'           => $invoiceStatus,
                'gateway_response' => $payload
            ]);

            TenantPayment::create([
                'tenant_invoice_id' => $invoice->id,
                'provider'          => 'midtrans',
                'payment_type'      => $payload['payment_type'] ?? null,
                'transaction_id'    => $payload['transaction_id'] ?? null,
                'order_id'          => $payload['order_id'],
                'gross_amount'      => $payload['gross_amount'],
                'status'            => $paymentStatus,
                'raw_response'      => $payload,
                'paid_at'           => null,
            ]);
            
            Membership::where('last_transaction_id', $invoice->id)
                ->orWhere('tenant_invoice_id', $invoice->id)
                ->update([
                    'status' => 'cancelled',
                    'notes'  => 'Dibatalkan otomatis karena pembayaran expired/gagal'
                ]);
            
            Log::info('[MembershipPayment] Pembayaran gagal, membership dibatalkan', ['invoice_id' => $invoice->id]);
        });
    }
}