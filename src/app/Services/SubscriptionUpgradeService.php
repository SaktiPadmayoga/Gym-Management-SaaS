<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;
use Exception;

class SubscriptionUpgradeService
{
    public function __construct()
    {
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = config('midtrans.is_sanitized');
        Config::$is3ds        = config('midtrans.is_3ds');
    }

    /**
     * Memproses request upgrade langganan dari Tenant.
     */
    public function upgrade(Tenant $tenant, object $newPlan, string $billingCycle, array $customerData): array
    {
        // 1. Cari langganan yang sedang berjalan (Trial / Active)
        $currentSub = DB::connection('central')->table('subscriptions')
            ->where('tenant_id', $tenant->id)
            ->whereIn('status', ['active', 'trial'])
            ->latest('created_at')
            ->first();

        if (!$currentSub) {
            throw new Exception('Tenant tidak memiliki langganan aktif atau trial.');
        }

        // 2. Tentukan Harga
        $amount = $billingCycle === 'yearly' ? $newPlan->price_yearly : $newPlan->price_monthly;

        // 3. Generate IDs
        $invoiceNumber = 'INV-' . date('Y') . '-' . strtoupper(Str::random(8));
        $orderId       = 'ORD-UPG-' . strtoupper($tenant->slug) . '-' . time();
        $invoiceId     = (string) Str::uuid();
        $newSubId      = (string) Str::uuid();

        return DB::transaction(function () use ($tenant, $newPlan, $billingCycle, $amount, $invoiceNumber, $orderId, $invoiceId, $newSubId, $currentSub, $customerData) {

            // A. Buat Subscription BARU (Status PENDING)
            DB::connection('central')->table('subscriptions')->insert([
                'id'                     => $newSubId,
                'tenant_id'              => $tenant->id,
                'plan_id'                => $newPlan->id,
                'status'                 => 'pending', // PENTING: Biarkan pending sampai lunas!
                'billing_cycle'          => $billingCycle,
                'amount'                 => $amount,
                'max_branches'           => $newPlan->max_branches ?? 1,
                'auto_renew'             => true,
                'started_at'             => null, // Akan diisi oleh Webhook
                'current_period_ends_at' => null, // Akan diisi oleh Webhook
                'created_at'             => now(),
                'updated_at'             => now(),
            ]);

            // B. Buat Invoice
            DB::connection('central')->table('invoices')->insert([
                'id'                 => $invoiceId,
                'tenant_id'          => $tenant->id,
                'subscription_id'    => $newSubId,
                'invoice_number'     => $invoiceNumber,
                'external_reference' => $orderId,
                'amount'             => $amount,
                'currency'           => $newPlan->currency ?? 'IDR',
                'payment_gateway'    => 'midtrans',
                'status'             => 'pending',
                'issued_at'          => now(),
                'due_date'           => now()->addDay(),
                'notes'              => json_encode([
                    'upgrade_from_sub_id' => $currentSub->id, // Simpan ID paket lama sebagai "contekan" buat Webhook
                    'plan_id'             => $newPlan->id,
                    'plan_name'           => $newPlan->name,
                    'billing_cycle'       => $billingCycle,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // C. Buat Payment (Sesuai tabel barumu)
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

            // D. Request Snap Token
            $snapToken = Snap::getSnapToken([
                'transaction_details' => [
                    'order_id'     => $orderId,
                    'gross_amount' => (int) $amount,
                ],
                'item_details' => [[
                    'id'       => $newPlan->id,
                    'price'    => (int) $amount,
                    'quantity' => 1,
                    'name'     => "Upgrade Plan: " . $newPlan->name . ' (' . ucfirst($billingCycle) . ')',
                ]],
                'customer_details' => [
                    'first_name' => $customerData['owner_name'] ?? $tenant->owner_name,
                    'email'      => $customerData['owner_email'] ?? $tenant->owner_email,
                    'phone'      => $customerData['phone'] ?? '',
                ],
            ]);

            return [
                'snap_token'      => $snapToken,
                'order_id'        => $orderId,
                'invoice_id'      => $invoiceId,
                'subscription_id' => $newSubId,
            ];
        });
    }
}