<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * POST /api/payment/token
     */
    public function createToken(Request $request)
    {
        try {
            $tenant = tenant();

            $validated = $request->validate([
                'plan_id'       => 'required|uuid',
                'billing_cycle' => 'required|in:monthly,yearly',
            ]);

            // Ambil plan
            $plan = DB::connection('central')
                ->table('plans')
                ->where('id', $validated['plan_id'])
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->first();

            if (!$plan) {
                return ApiResponse::error('Plan not found', null, 404);
            }

            // Ambil amount dari kolom langsung
            $amount = $validated['billing_cycle'] === 'yearly'
                ? $plan->price_yearly
                : $plan->price_monthly;

            if (!$amount || $amount <= 0) {
                return ApiResponse::error('Invalid plan pricing', null, 422);
            }

            // Ambil tenant data
            $tenantData = DB::connection('central')
                ->table('tenants')
                ->where('id', $tenant->id)
                ->first();

            // ✅ Sesuai kolom migration tenant
            $customerEmail = $tenantData->owner_email ?? null;
            if (!$customerEmail || !filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                $customerEmail = $tenant->slug . '@tenant.local';
            }
            $customerName = $tenantData->owner_name ?? $tenantData->name ?? $tenant->slug;

            $invoiceNumber = 'INV-' . date('Y') . '-' . strtoupper(Str::random(8));
            $orderId       = 'ORD-' . strtoupper($tenant->slug) . '-' . time();
            $snapToken     = null;

            DB::connection('central')->transaction(function () use (
                $tenant, $plan, $validated, $amount, $invoiceNumber,
                $orderId, $customerName, $customerEmail, &$snapToken
            ) {
                // Cek apakah sudah ada subscription
                $existingSubscription = DB::connection('central')
                    ->table('subscriptions')
                    ->where('tenant_id', $tenant->id)
                    ->first();

                if ($existingSubscription) {
                    // Update subscription existing ke pending
                    DB::connection('central')
                        ->table('subscriptions')
                        ->where('tenant_id', $tenant->id)
                        ->update([
                            'plan_id'       => $plan->id,
                            'status'        => 'pending',
                            'billing_cycle' => $validated['billing_cycle'],
                            'updated_at'    => now(),
                        ]);

                    $subscriptionId = $existingSubscription->id;
                } else {
                    // Buat baru jika belum ada
                    $subscriptionId = (string) Str::uuid();
                    DB::connection('central')->table('subscriptions')->insert([
                        'id'            => $subscriptionId,
                        'tenant_id'     => $tenant->id,
                        'plan_id'       => $plan->id,
                        'status'        => 'pending',
                        'billing_cycle' => $validated['billing_cycle'],
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]);
                }

                // Buat invoice
                $invoiceId = (string) Str::uuid();
                DB::connection('central')->table('invoices')->insert([
                    'id'                 => $invoiceId,
                    'tenant_id'          => $tenant->id,
                    'subscription_id'    => $subscriptionId,
                    'invoice_number'     => $invoiceNumber,
                    'external_reference' => $orderId,
                    'amount'             => $amount,
                    'currency'           => $plan->currency ?? 'IDR',
                    'payment_gateway'    => 'midtrans',
                    'status'             => 'pending',
                    'issued_at'          => now(),
                    'due_date'           => now()->addDay(),
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ]);

                // Buat payment record
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

                // Buat Midtrans Snap token
                $params = [
                    'transaction_details' => [
                        'order_id'     => $orderId,
                        'gross_amount' => (int) $amount,
                    ],
                    'item_details' => [
                        [
                            'id'       => $plan->id,
                            'price'    => (int) $amount,
                            'quantity' => 1,
                            'name'     => $plan->name . ' - ' . ucfirst($validated['billing_cycle']),
                        ],
                    ],
                    'customer_details' => [
                        'first_name' => $customerName,
                        'email'      => $customerEmail,
                    ],
                    'callbacks' => [
                        'finish' => env('FRONTEND_URL', 'http://localhost:3000')
                            . '/owner/subscription/success?order_id=' . $orderId,
                    ],
                ];

                $snapToken = Snap::getSnapToken($params);
            });

            return ApiResponse::success([
                'snap_token'     => $snapToken,
                'order_id'       => $orderId,
                'invoice_number' => $invoiceNumber,
                'amount'         => $amount,
                'client_key'     => config('midtrans.client_key'),
            ], 'Payment token created successfully');

        } catch (\Exception $e) {
            Log::error('Error creating payment token', ['error' => $e->getMessage()]);
            return ApiResponse::error(
                'Failed to create payment token',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

    /**
     * POST /api/payment/webhook
     */
    public function webhook(Request $request)
    {
        try {
            Config::$serverKey    = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production');

            // ✅ Log raw request untuk debug
            Log::info('Webhook incoming', ['body' => $request->getContent()]);

            $notification = new Notification();

            $orderId           = $notification->order_id;
            $statusCode        = $notification->status_code;
            $grossAmount       = $notification->gross_amount;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus       = $notification->fraud_status ?? null;
            $paymentType       = $notification->payment_type;
            $transactionId     = $notification->transaction_id;
            $signatureKey      = $notification->signature_key;

            Log::info('Webhook data', [
                'order_id'           => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status'       => $fraudStatus,
                'status_code'        => $statusCode,
                'gross_amount'       => $grossAmount,
            ]);

            // Verifikasi signature
            $localSignature = hash(
                'sha512',
                $orderId . $statusCode . $grossAmount . config('midtrans.server_key')
            );

            if ($localSignature !== $signatureKey) {
                Log::warning('Invalid signature', [
                    'expected' => $localSignature,
                    'received' => $signatureKey,
                ]);
                return response()->json(['message' => 'Invalid signature'], 403);
            }

            // Cari invoice
            $invoice = DB::connection('central')
                ->table('invoices')
                ->where('external_reference', $orderId)
                ->first();

            if (!$invoice) {
                Log::error('Invoice not found', ['order_id' => $orderId]);
                // ✅ Return 200 agar Midtrans tidak retry terus
                return response()->json(['message' => 'Invoice not found'], 200);
            }

            if ($invoice->status === 'paid') {
                return response()->json(['message' => 'Already processed'], 200);
            }

            // Tentukan status
            $isPaid   = false;
            $isFailed = false;

            if ($transactionStatus === 'capture') {
                $isPaid = $fraudStatus === 'accept';
            } elseif ($transactionStatus === 'settlement') {
                $isPaid = true;
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $isFailed = true;
            }

            Log::info('Payment status determined', [
                'isPaid'   => $isPaid,
                'isFailed' => $isFailed,
            ]);

            DB::connection('central')->transaction(function () use (
                $invoice, $request, $isPaid, $isFailed,
                $paymentType, $transactionId, $transactionStatus
            ) {
                // ✅ Pakai $request->getContent() bukan $notification->getResponse()
                $rawResponse = $request->getContent();

                if ($isPaid) {
                    DB::connection('central')
                        ->table('invoices')
                        ->where('id', $invoice->id)
                        ->update([
                            'status'           => 'paid',
                            'payment_method'   => $paymentType,
                            'transaction_id'   => $transactionId,
                            'paid_at'          => now(),
                            'gateway_response' => $rawResponse,
                            'updated_at'       => now(),
                        ]);

                    DB::connection('central')
                        ->table('payments')
                        ->where('invoice_id', $invoice->id)
                        ->update([
                            'status'         => 'success',
                            'payment_type'   => $paymentType,
                            'transaction_id' => $transactionId,
                            'raw_response'   => $rawResponse,
                            'paid_at'        => now(),
                            'updated_at'     => now(),
                        ]);

                    $this->activateSubscription($invoice);

                } elseif ($isFailed) {
                    $statusLabel = $transactionStatus === 'expire' ? 'expired' : 'failed';

                    DB::connection('central')
                        ->table('invoices')
                        ->where('id', $invoice->id)
                        ->update([
                            'status'           => $statusLabel,
                            'gateway_response' => $rawResponse,
                            'updated_at'       => now(),
                        ]);

                    DB::connection('central')
                        ->table('payments')
                        ->where('invoice_id', $invoice->id)
                        ->update([
                            'status'       => $statusLabel,
                            'raw_response' => $rawResponse,
                            'updated_at'   => now(),
                        ]);
                }
            });

            Log::info('Webhook processed successfully', ['order_id' => $orderId]);
            return response()->json(['message' => 'OK'], 200);

        } catch (\Exception $e) {
            Log::error('Webhook Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'trace'   => $e->getTraceAsString(),
            ]);

            // ✅ Tetap return 200 agar Midtrans tidak spam retry
            // Error sudah tercatat di log
            return response()->json([
                'message' => 'Error logged',
                'debug'   => config('app.debug') ? $e->getMessage() : null,
            ], 200);
        }
    }

    /**
     * Aktivasi subscription setelah payment sukses
     */
    protected function activateSubscription(object $invoice): void
    {
        $subscription = DB::connection('central')
            ->table('subscriptions')
            ->where('id', $invoice->subscription_id)
            ->first();

        if (!$subscription) {
            Log::error('Subscription not found for activation', ['invoice_id' => $invoice->id]);
            return;
        }

        // Ambil plan — ✅ kolom langsung sesuai migration
        $plan = DB::connection('central')
            ->table('plans')
            ->where('id', $subscription->plan_id)
            ->first();

        // ✅ max_branches langsung dari kolom, bukan dari JSON limits
        $maxBranches = $plan->max_branches ?? 0;

        $startedAt = now();
        $endsAt    = $subscription->billing_cycle === 'yearly'
            ? now()->addYear()
            : now()->addMonth();

        // Cancel subscription lama yang active
        DB::connection('central')
            ->table('subscriptions')
            ->where('tenant_id', $invoice->tenant_id)
            ->where('status', 'active')
            ->update([
                'status'      => 'cancelled',
                'canceled_at' => now(),
                'updated_at'  => now(),
            ]);

        // Aktivasi subscription baru
        DB::connection('central')
            ->table('subscriptions')
            ->where('id', $invoice->subscription_id)
            ->update([
                'status'                  => 'active',
                'started_at'              => $startedAt,
                'current_period_ends_at'  => $endsAt,
                'updated_at'              => now(),
            ]);

        // Update tenant data
        DB::connection('central')
            ->table('tenants')
            ->where('id', $invoice->tenant_id)
            ->update([
                'max_branches'         => $maxBranches,
                'subscription_ends_at' => $endsAt,
                'status'               => 'active',
                'updated_at'           => now(),
            ]);

        Log::info('Subscription activated via payment', [
            'tenant_id'   => $invoice->tenant_id,
            'plan'        => $plan->name,
            'ends_at'     => $endsAt,
            'max_branches'=> $maxBranches,
        ]);
    }
}