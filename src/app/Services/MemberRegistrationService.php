<?php

namespace App\Services;

use App\Models\Tenant\Member;
use App\Models\Tenant\Membership;
use App\Models\Tenant\MembershipPlan;
use App\Models\Tenant\TenantInvoice;
use App\Models\Tenant\TenantPayment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class MemberRegistrationService
{
    public function __construct(
        protected MidtransService $midtrans
    ) {}

    /**
     * Proses registrasi member baru:
     * 1. Buat Member (inactive)
     * 2. Buat Invoice + Invoice Items
     * 3. Buat Membership (pending) yang terhubung ke invoice
     * 4. Ambil Snap Token dari Midtrans
     *
     * @return array{member: Member, invoice: TenantInvoice, snap_token: string}
     */
    public function register(array $data, MembershipPlan $plan, ?string $branchId = null): array
    {
        return DB::transaction(function () use ($data, $plan, $branchId) {

            // ------------------------------------------------------------------
            // 1. Buat Member (Inactive — aktif setelah pembayaran berhasil)
            // ------------------------------------------------------------------
            $member = Member::create([
                'name'           => $data['name'],
                'email'          => $data['email'],
                'password'       => Hash::make($data['password']),
                'phone'          => $data['phone'],
                'status'         => 'inactive',
                'is_active'      => false,
                'member_since'   => null,
                'qr_token'       => (string) Str::uuid(),
                'home_branch_id' => $branchId ?? $plan->branch_id,
            ]);

            // ------------------------------------------------------------------
            // 2. Buat Invoice
            // ------------------------------------------------------------------
            $invoice = TenantInvoice::create([
                'tenant_id'      => tenant('id'),
                'member_id'      => $member->id,
                'branch_id'      => $branchId ?? $plan->branch_id,
                'invoice_number'  => TenantInvoice::generateInvoiceNumber('MEM'),
                'subtotal'       => $plan->price,
                'tax'            => 0,
                'total_amount'   => $plan->price,
                'currency'       => 'IDR',
                'payment_gateway'=> 'midtrans',
                'status'         => 'pending',
                'issued_at'      => now(),
                'due_date'       => now()->addHours(24),
            ]);

            // ------------------------------------------------------------------
            // 3. Buat Invoice Items (polymorphic ke MembershipPlan)
            // ------------------------------------------------------------------
            $invoice->items()->create([
                'item_type'  => MembershipPlan::class,
                'item_id'    => $plan->id,
                'item_name'  => $plan->name,
                'quantity'   => 1,
                'unit_price' => $plan->price,
                'total_price'=> $plan->price,
            ]);

            // ------------------------------------------------------------------
            // 4. Buat Membership (Pending — aktif setelah webhook konfirmasi)
            // ------------------------------------------------------------------
            $membership = Membership::create([
                'member_id'               => $member->id,
                'membership_plan_id'      => $plan->id,
                'branch_id'               => $branchId ?? $plan->branch_id,
                'tenant_invoice_id'       => $invoice->id,   // relasi langsung ke invoice
                'start_date'              => now()->toDateString(),
                'status'                  => 'pending',
                'unlimited_checkin'       => $plan->unlimited_checkin,
                'remaining_checkin_quota' => $plan->checkin_quota_per_month,
            ]);

            // ------------------------------------------------------------------
            // 5. Ambil Snap Token dari Midtrans
            //    external_reference di invoice = invoice_number (order_id di Midtrans)
            // ------------------------------------------------------------------
            $snapToken = $this->midtrans->getSnapToken(
                orderId:     $invoice->invoice_number,
                grossAmount: (int) $plan->price,
                member:      $member,
                plan:        $plan,
            );

            // Simpan external_reference agar mudah lookup saat webhook
            $invoice->update(['external_reference' => $invoice->invoice_number]);

            return [
                'member'     => $member->fresh(),
                'invoice'    => $invoice->fresh(['items']),
                'snap_token' => $snapToken,
            ];
        });
    }

    /**
     * Proses konfirmasi pembayaran dari webhook Midtrans.
     * Dipanggil HANYA ketika signature valid dan status = settlement/capture.
     *
     * @return bool — true jika berhasil diproses, false jika sudah diproses sebelumnya
     */
    /**
 * Proses konfirmasi pembayaran dari webhook Midtrans.
 */
    public function confirmPayment(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? null;

        if (!$orderId) {
            Log::error('Webhook confirmPayment: order_id is empty');
            return false;
        }

        // ✅ Tidak perlu ::on('tenant') — tenant context sudah aktif dari controller
        $invoice = TenantInvoice::where('invoice_number', $orderId)
            ->with(['membership', 'membership.plan', 'member'])
            ->first();

        if (!$invoice) {
            Log::error('confirmPayment: invoice not found', ['order_id' => $orderId]);
            return false;
        }

        if ($invoice->isPaid()) {
            Log::info('Invoice already paid, skipping', ['order_id' => $orderId]);
            return false;
        }

        // ✅ Tidak perlu DB::connection('tenant') — sudah dalam tenant context
        DB::transaction(function () use ($invoice, $payload) {
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

            $invoice->update([
                'status'           => 'paid',
                'payment_method'   => $payload['payment_type'] ?? null,
                'transaction_id'   => $payload['transaction_id'] ?? null,
                'paid_at'          => now(),
                'gateway_response' => $payload,
            ]);

            $membership = $invoice->membership;
            if ($membership && $membership->status === 'pending') {
                $membership->activate(now());
            }

            $invoice->member->update([
                'status'       => 'active',
                'is_active'    => true,
                'member_since' => now(),
            ]);
        });

        return true;
    }

    /**
     * Tandai invoice & payment sebagai expired/failed.
     * Dipanggil dari webhook ketika status = expire / deny / cancel.
     */
    public function handleFailedPayment(array $payload, string $paymentStatus): void
    {
        $invoice = TenantInvoice::where('invoice_number', $payload['order_id'])->first();

        if (! $invoice || $invoice->isPaid()) {
            return;
        }

        DB::transaction(function () use ($invoice, $payload, $paymentStatus) {
            TenantPayment::create([
                'tenant_invoice_id' => $invoice->id,
                'provider'          => 'midtrans',
                'payment_type'      => $payload['payment_type'] ?? null,
                'transaction_id'    => $payload['transaction_id'] ?? null,
                'order_id'          => $payload['order_id'],
                'gross_amount'      => $payload['gross_amount'],
                'status'            => $paymentStatus, // 'failed', 'expired'
                'raw_response'      => $payload,
                'paid_at'           => null,
            ]);

            $invoiceStatus = match ($paymentStatus) {
                'expired' => 'expired',
                default   => 'failed',
            };

            $invoice->update(['status' => $invoiceStatus]);
        });
    }
}