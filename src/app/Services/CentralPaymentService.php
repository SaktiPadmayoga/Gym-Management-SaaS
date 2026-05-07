<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;

class CentralPaymentService
{
    public function __construct()
    {
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = config('midtrans.is_sanitized');
        Config::$is3ds        = config('midtrans.is_3ds');
    }

    /**
     * Membuat Invoice, Payment, dan Midtrans Token.
     * Digunakan untuk Registrasi awal ATAU Upgrade.
     */
    public function createPaymentToken(Tenant $tenant, object $plan, string $billingCycle, array $customerData, ?string $oldSubId = null): array
    {
        $amount = $billingCycle === 'yearly' ? $plan->price_yearly : $plan->price_monthly;

        // Expire semua invoice pending lama milik tenant ini agar tidak dobel
        $pendingInvoices = DB::connection('central')->table('invoices')
            ->where('tenant_id', $tenant->id)
            ->where('status', 'pending')
            ->get();

        foreach ($pendingInvoices as $pendingInvoice) {
            DB::connection('central')->table('invoices')->where('id', $pendingInvoice->id)->update(['status' => 'expired', 'updated_at' => now()]);
            DB::connection('central')->table('payments')->where('invoice_id', $pendingInvoice->id)->update(['status' => 'expired', 'updated_at' => now()]);
        }

        $invoiceNumber = 'INV-' . date('Y') . '-' . strtoupper(Str::random(8));
        // Jika ada oldSubId, berarti ini UPGRADE, gunakan prefix ORD-UPG
        $orderPrefix   = $oldSubId ? 'ORD-UPG-' : 'ORD-REG-';
        $orderId       = $orderPrefix . strtoupper($tenant->slug) . '-' . time();
        $invoiceId     = (string) Str::uuid();

        return DB::transaction(function () use ($tenant, $plan, $billingCycle, $amount, $invoiceNumber, $orderId, $invoiceId, $customerData, $oldSubId) {

            // 1. Buat Invoice (Status Pending)
            DB::connection('central')->table('invoices')->insert([
                'id'                 => $invoiceId,
                'tenant_id'          => $tenant->id,
                'subscription_id'    => null, // Diisi saat lunas
                'invoice_number'     => $invoiceNumber,
                'external_reference' => $orderId,
                'amount'             => $amount,
                'currency'           => $plan->currency ?? 'IDR',
                'payment_gateway'    => 'midtrans',
                'status'             => 'pending',
                'issued_at'          => now(),
                'due_date'           => now()->addDay(),
                'notes'              => json_encode([
                    'plan_id'             => $plan->id,
                    'plan_name'           => $plan->name,
                    'billing_cycle'       => $billingCycle,
                    'upgrade_from_sub_id' => $oldSubId // Jika null, berarti registrasi baru
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Buat Payment (Status Pending)
            DB::connection('central')->table('payments')->insert([
                'id'           => (string) Str::uuid(),
                'tenant_id'    => $tenant->id,
                'invoice_id'   => $invoiceId,
                'provider'     => 'midtrans',
                'order_id'     => $orderId,
                'gross_amount' => $amount,
                'status'       => 'pending',
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            // 3. Request Midtrans Snap Token
            $snapToken = Snap::getSnapToken([
                'transaction_details' => [
                    'order_id'     => $orderId,
                    'gross_amount' => (int) $amount,
                ],
                'item_details' => [[
                    'id'       => $plan->id,
                    'price'    => (int) $amount,
                    'quantity' => 1,
                    'name'     => ($oldSubId ? "Upgrade: " : "Langganan: ") . $plan->name . ' (' . ucfirst($billingCycle) . ')',
                ]],
                'customer_details' => [
                    'first_name' => $customerData['owner_name'],
                    'email'      => $customerData['owner_email'],
                    'phone'      => $customerData['phone'] ?? '',
                ],
            ]);

            return [
                'snap_token'     => $snapToken,
                'order_id'       => $orderId,
                'invoice_number' => $invoiceNumber,
                'invoice_id'     => $invoiceId,
            ];
        });
    }

    /**
     * Aktivasi Subscription setelah pembayaran lunas
     */
    public function activateSubscription(object $invoice, string $bodyStr, ?string $paymentType, ?string $transactionId): void
    {
        DB::connection('central')->transaction(function () use ($invoice, $bodyStr, $paymentType, $transactionId) {
            
            // 1. Update Invoice & Payment
            DB::connection('central')->table('invoices')->where('id', $invoice->id)->update([
                'status'           => 'paid',
                'payment_method'   => $paymentType,
                'transaction_id'   => $transactionId,
                'paid_at'          => now(),
                'gateway_response' => $bodyStr,
                'updated_at'       => now(),
            ]);

            DB::connection('central')->table('payments')->where('invoice_id', $invoice->id)->update([
                'status'         => 'success',
                'payment_type'   => $paymentType,
                'transaction_id' => $transactionId,
                'raw_response'   => $bodyStr,
                'paid_at'        => now(),
                'updated_at'     => now(),
            ]);

            // 2. Baca informasi dari Notes Invoice
            $notes        = json_decode($invoice->notes ?? '{}', true);
            $planId       = $notes['plan_id'] ?? null;
            $billingCycle = $notes['billing_cycle'] ?? 'monthly';
            $oldSubId     = $notes['upgrade_from_sub_id'] ?? null;

            if (!$planId) {
                Log::error('activateSubscription: plan_id not in notes', ['invoice_id' => $invoice->id]);
                return;
            }

            $plan = DB::connection('central')->table('plans')->where('id', $planId)->first();
            if (!$plan) return;

            $tenant = DB::connection('central')->table('tenants')->where('id', $invoice->tenant_id)->first();
            $oldSubscription = $oldSubId
                ? DB::connection('central')->table('subscriptions')->where('id', $oldSubId)->first()
                : DB::connection('central')->table('subscriptions')
                    ->where('tenant_id', $invoice->tenant_id)
                    ->whereIn('status', ['active', 'trial', 'past_due'])
                    ->latest('created_at')
                    ->first();
            $oldPlan = $oldSubscription
                ? DB::connection('central')->table('plans')->where('id', $oldSubscription->plan_id)->first()
                : null;

            // 3. Batalkan Subscription Lama (Jika ada atau jika ini upgrade)
            DB::connection('central')->table('subscriptions')
                ->where('tenant_id', $invoice->tenant_id)
                ->whereIn('status', ['active', 'trial', 'past_due'])
                ->update([
                    'status'      => 'cancelled',
                    'canceled_at' => now(),
                    'updated_at'  => now(),
                ]);

            // 4. Buat Subscription Baru
            $newSubscriptionId = (string) Str::uuid();
            $startedAt         = now();
            $endsAt            = $billingCycle === 'yearly' ? now()->addYear() : now()->addMonth();

            DB::connection('central')->table('subscriptions')->insert([
                'id'                     => $newSubscriptionId,
                'tenant_id'              => $invoice->tenant_id,
                'plan_id'                => $planId,
                'status'                 => 'active',
                'billing_cycle'          => $billingCycle,
                'amount'                 => $invoice->amount,
                'max_branches'           => $plan->max_branches ?? 1,
                'auto_renew'             => true,
                'started_at'             => $startedAt,
                'current_period_ends_at' => $endsAt,
                'last_invoice_id'        => $invoice->id,
                'created_at'             => now(),
                'updated_at'             => now(),
            ]);

            // 5. Tautkan Invoice ke Subscription Baru
            DB::connection('central')->table('invoices')->where('id', $invoice->id)->update([
                'subscription_id' => $newSubscriptionId,
            ]);

            // 6. Update Tenant Status
            DB::connection('central')->table('tenants')->where('id', $invoice->tenant_id)->update([
                'max_branches'         => $plan->max_branches ?? 1,
                'subscription_ends_at' => $endsAt,
                'status'               => 'active',
                'updated_at'           => now(),
            ]);

            DB::connection('central')->table('notifications')->insert([
                'id'         => (string) Str::uuid(),
                'type'       => 'payment_success',
                'title'      => 'Pembayaran Langganan Lunas! 💰',
                'message'    => "Pembayaran sebesar Rp " . number_format($invoice->amount, 0, ',', '.') . " dari tenant {$invoice->tenant_id} telah diterima.",
                'is_read'    => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($oldPlan && $oldPlan->id !== $plan->id) {
                $changeType = ((float) $invoice->amount >= (float) ($oldSubscription->amount ?? 0))
                    ? 'upgrade'
                    : 'downgrade';
                $tenantName = $tenant->name ?? $invoice->tenant_id;

                app(NotificationService::class)->createCentral(
                    "subscription_{$changeType}",
                    $changeType === 'upgrade' ? 'Upgrade Paket Langganan' : 'Downgrade Paket Langganan',
                    "Tenant {$tenantName} melakukan {$changeType} paket dari {$oldPlan->name} ke {$plan->name} ({$billingCycle})."
                );
            }

            Log::info('activateSubscription: completed', ['tenant_id' => $invoice->tenant_id]);
        });
    }

    /**
     * Gagalkan Pembayaran
     */
    public function failPayment(object $invoice, string $bodyStr, string $statusLabel): void
    {
        DB::connection('central')->transaction(function () use ($invoice, $bodyStr, $statusLabel) {
            DB::connection('central')->table('invoices')->where('id', $invoice->id)->update([
                'status'           => $statusLabel,
                'gateway_response' => $bodyStr,
                'updated_at'       => now(),
            ]);

            DB::connection('central')->table('payments')->where('invoice_id', $invoice->id)->update([
                'status'       => $statusLabel,
                'raw_response' => $bodyStr,
                'updated_at'   => now(),
            ]);

            DB::connection('central')->table('notifications')->insert([
                'id'         => (string) Str::uuid(),
                'type'       => 'payment_failed',
                'title'      => 'Pembayaran Gagal/Kedaluwarsa ⚠️',
                'message'    => "Tagihan {$invoice->invoice_number} sebesar Rp " . number_format($invoice->amount, 0, ',', '.') . " gagal dibayar/expired.",
                'is_read'    => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    }
}
