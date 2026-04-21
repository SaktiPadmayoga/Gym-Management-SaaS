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
use App\Http\Controllers\Tenant\MidtransWebhookController;

class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = config('midtrans.is_sanitized');
        Config::$is3ds        = config('midtrans.is_3ds');
    }

    /**
     * POST /api/payment/token
     * Hanya buat invoice + payment record + Midtrans token
     * Subscription baru dibuat HANYA saat webhook sukses
     */
    public function createToken(Request $request)
    {
        try {
            $tenant = tenant();

            $validated = $request->validate([
                'plan_id'       => 'required|uuid',
                'billing_cycle' => 'required|in:monthly,yearly',
            ]);

            $plan = DB::connection('central')
                ->table('plans')
                ->where('id', $validated['plan_id'])
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->first();

            if (!$plan) {
                return ApiResponse::error('Plan not found', null, 404);
            }

            $amount = $validated['billing_cycle'] === 'yearly'
                ? $plan->price_yearly
                : $plan->price_monthly;

            if (!$amount || $amount <= 0) {
                return ApiResponse::error('Invalid plan pricing', null, 422);
            }

            $tenantData = DB::connection('central')
                ->table('tenants')
                ->where('id', $tenant->id)
                ->first();

            $customerEmail = $tenantData->owner_email ?? null;
            if (!$customerEmail || !filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                $customerEmail = $tenant->slug . '@tenant.local';
            }
            $customerName = $tenantData->owner_name ?? $tenantData->name ?? $tenant->slug;

            // Expire semua invoice pending lama
            $pendingInvoices = DB::connection('central')
                ->table('invoices')
                ->where('tenant_id', $tenant->id)
                ->where('status', 'pending')
                ->get();

            foreach ($pendingInvoices as $pendingInvoice) {
                DB::connection('central')
                    ->table('invoices')
                    ->where('id', $pendingInvoice->id)
                    ->update(['status' => 'expired', 'updated_at' => now()]);

                DB::connection('central')
                    ->table('payments')
                    ->where('invoice_id', $pendingInvoice->id)
                    ->where('status', 'pending')
                    ->update(['status' => 'expired', 'updated_at' => now()]);
            }

            $invoiceNumber = 'INV-' . date('Y') . '-' . strtoupper(Str::random(8));
            $orderId       = 'ORD-' . strtoupper($tenant->slug) . '-' . time();
            $invoiceId     = (string) Str::uuid();
            $snapToken     = null;

            DB::connection('central')->transaction(function () use (
                $tenant, $plan, $validated, $amount, $invoiceNumber,
                $orderId, $invoiceId, $customerName, $customerEmail, &$snapToken
            ) {
                // Simpan invoice tanpa subscription_id
                // subscription_id akan diisi saat webhook sukses
                DB::connection('central')->table('invoices')->insert([
                    'id'                 => $invoiceId,
                    'tenant_id'          => $tenant->id,
                    'subscription_id'    => null,
                    'invoice_number'     => $invoiceNumber,
                    'external_reference' => $orderId,
                    'amount'             => $amount,
                    'currency'           => $plan->currency ?? 'IDR',
                    'payment_gateway'    => 'midtrans',
                    'status'             => 'pending',
                    'issued_at'          => now(),
                    'due_date'           => now()->addDay(),
                    // Simpan data yang dibutuhkan saat aktivasi
                    'notes' => json_encode([
                        'plan_id'       => $plan->id,
                        'plan_name'     => $plan->name,
                        'billing_cycle' => $validated['billing_cycle'],
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

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

                $snapToken = Snap::getSnapToken([
                    'transaction_details' => [
                        'order_id'     => $orderId,
                        'gross_amount' => (int) $amount,
                    ],
                    'item_details' => [[
                        'id'       => $plan->id,
                        'price'    => (int) $amount,
                        'quantity' => 1,
                        'name'     => $plan->name . ' - ' . ucfirst($validated['billing_cycle']),
                    ]],
                    'customer_details' => [
                        'first_name' => $customerName,
                        'email'      => $customerEmail,
                    ],
                    'callbacks' => [
                        'finish' => env('FRONTEND_URL', 'http://localhost:3000')
                            . '/owner/subscription/success?order_id=' . $orderId,
                    ],
                ]);
            });

            return ApiResponse::success([
                'snap_token'     => $snapToken,
                'order_id'       => $orderId,
                'invoice_number' => $invoiceNumber,
                'amount'         => $amount,
                'client_key'     => config('midtrans.client_key'),
            ], 'Payment token created successfully');

        } catch (\Exception $e) {
            Log::error('createToken error', [
                'message' => $e->getMessage(),
                'line'    => $e->getLine(),
            ]);
            return ApiResponse::error(
                'Failed to create payment token',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

    /**
     * POST /api/payment/webhook
     * Dipanggil Midtrans setelah payment
     */
    public function webhook(Request $request)
    {

        $payload = $request->all();
        $orderId = $payload['order_id'] ?? null;

        // Routing berdasarkan prefix order_id
        if (!str_starts_with($orderId, 'ORD-')) {
            return app(MidtransWebhookController::class)->handle($request);
        }



        try {
            Config::$serverKey    = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production');

            $body = $request->getContent();
            Log::info('Webhook incoming', ['body' => $body]);

            // Parse manual dari request body — lebih reliable dari Notification class
            $data = json_decode($body, true);

            if (!$data) {
                Log::error('Webhook: invalid JSON body');
                return response()->json(['message' => 'Invalid body'], 200);
            }

            $orderId           = $data['order_id'] ?? null;
            $statusCode        = $data['status_code'] ?? null;
            $grossAmount       = $data['gross_amount'] ?? null;
            $transactionStatus = $data['transaction_status'] ?? null;
            $fraudStatus       = $data['fraud_status'] ?? null;
            $paymentType       = $data['payment_type'] ?? null;
            $transactionId     = $data['transaction_id'] ?? null;
            $signatureKey      = $data['signature_key'] ?? null;

            Log::info('Webhook parsed', [
                'order_id'           => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status'       => $fraudStatus,
                'status_code'        => $statusCode,
            ]);

            if (!$orderId || !$signatureKey) {
                Log::error('Webhook: missing required fields');
                return response()->json(['message' => 'Missing fields'], 200);
            }

            // Verifikasi signature
            $localSignature = hash(
                'sha512',
                $orderId . $statusCode . $grossAmount . config('midtrans.server_key')
            );

            if ($localSignature !== $signatureKey) {
                Log::warning('Webhook: invalid signature', [
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
                Log::error('Webhook: invoice not found', ['order_id' => $orderId]);
                return response()->json(['message' => 'Invoice not found'], 200);
            }

            if ($invoice->status === 'paid') {
                Log::info('Webhook: already processed', ['order_id' => $orderId]);
                return response()->json(['message' => 'Already processed'], 200);
            }

            // Tentukan status pembayaran
            $isPaid = ($transactionStatus === 'capture' && $fraudStatus === 'accept')
                   || ($transactionStatus === 'settlement');

            $isFailed = in_array($transactionStatus, ['cancel', 'deny', 'expire']);

            Log::info('Webhook: status determined', [
                'isPaid'   => $isPaid,
                'isFailed' => $isFailed,
            ]);

            if ($isPaid) {
                DB::connection('central')->transaction(function () use (
                    $invoice, $body, $paymentType, $transactionId
                ) {
                    // Update invoice
                    DB::connection('central')
                        ->table('invoices')
                        ->where('id', $invoice->id)
                        ->update([
                            'status'           => 'paid',
                            'payment_method'   => $paymentType,
                            'transaction_id'   => $transactionId,
                            'paid_at'          => now(),
                            'gateway_response' => $body,
                            'updated_at'       => now(),
                        ]);

                    // Update payment
                    DB::connection('central')
                        ->table('payments')
                        ->where('invoice_id', $invoice->id)
                        ->update([
                            'status'         => 'success',
                            'payment_type'   => $paymentType,
                            'transaction_id' => $transactionId,
                            'raw_response'   => $body,
                            'paid_at'        => now(),
                            'updated_at'     => now(),
                        ]);

                    // Buat subscription baru + cancel lama
                    $this->activateSubscription($invoice);
                });

            } elseif ($isFailed) {
                $statusLabel = $transactionStatus === 'expire' ? 'expired' : 'failed';

                DB::connection('central')->transaction(function () use (
                    $invoice, $body, $statusLabel
                ) {
                    DB::connection('central')
                        ->table('invoices')
                        ->where('id', $invoice->id)
                        ->update([
                            'status'           => $statusLabel,
                            'gateway_response' => $body,
                            'updated_at'       => now(),
                        ]);

                    DB::connection('central')
                        ->table('payments')
                        ->where('invoice_id', $invoice->id)
                        ->update([
                            'status'       => $statusLabel,
                            'raw_response' => $body,
                            'updated_at'   => now(),
                        ]);
                });
            }

            Log::info('Webhook: processed successfully', ['order_id' => $orderId]);
            return response()->json(['message' => 'OK'], 200);

        } catch (\Exception $e) {
            Log::error('Webhook error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Error logged',
                'debug'   => config('app.debug') ? $e->getMessage() : null,
            ], 200);
        }
    }

    /**
     * Aktivasi subscription:
     * 1. Cancel semua subscription aktif/trial lama
     * 2. Buat subscription BARU dengan status active
     * 3. Update invoice subscription_id ke yang baru
     * 4. Update tenant
     */
    protected function activateSubscription(object $invoice): void
    {
        Log::info('activateSubscription start', ['invoice_id' => $invoice->id]);

        // Baca info dari notes invoice
        $notes        = json_decode($invoice->notes ?? '{}', true);
        $planId       = $notes['plan_id'] ?? null;
        $billingCycle = $notes['billing_cycle'] ?? 'monthly';

        if (!$planId) {
            Log::error('activateSubscription: plan_id not in notes', [
                'invoice_id' => $invoice->id,
                'notes'      => $invoice->notes,
            ]);
            return;
        }

        $plan = DB::connection('central')
            ->table('plans')
            ->where('id', $planId)
            ->first();

        if (!$plan) {
            Log::error('activateSubscription: plan not found', ['plan_id' => $planId]);
            return;
        }

        $maxBranches = $plan->max_branches ?? 1;
        $startedAt   = now();
        $endsAt      = $billingCycle === 'yearly'
            ? now()->addYear()
            : now()->addMonth();

        // Cancel semua subscription lama
        $cancelledCount = DB::connection('central')
            ->table('subscriptions')
            ->where('tenant_id', $invoice->tenant_id)
            ->whereIn('status', ['active', 'trial', 'past_due'])
            ->update([
                'status'      => 'cancelled',
                'canceled_at' => now(),
                'updated_at'  => now(),
            ]);

        Log::info('activateSubscription: old subscriptions cancelled', [
            'count' => $cancelledCount,
        ]);

        // Buat subscription baru
        $newSubscriptionId = (string) Str::uuid();
        DB::connection('central')->table('subscriptions')->insert([
            'id'                     => $newSubscriptionId,
            'tenant_id'              => $invoice->tenant_id,
            'plan_id'                => $planId,
            'status'                 => 'active',
            'billing_cycle'          => $billingCycle,
            'amount'                 => $invoice->amount,
            'max_branches'           => $maxBranches,
            'auto_renew'             => true,
            'started_at'             => $startedAt,
            'current_period_ends_at' => $endsAt,
            'last_invoice_id'        => $invoice->id,
            'created_at'             => now(),
            'updated_at'             => now(),
        ]);

        Log::info('activateSubscription: new subscription created', [
            'subscription_id' => $newSubscriptionId,
        ]);

        // Update invoice — tautkan ke subscription baru
        DB::connection('central')
            ->table('invoices')
            ->where('id', $invoice->id)
            ->update([
                'subscription_id' => $newSubscriptionId,
                'updated_at'      => now(),
            ]);

        // Update tenant
        DB::connection('central')
            ->table('tenants')
            ->where('id', $invoice->tenant_id)
            ->update([
                'max_branches'         => $maxBranches,
                'subscription_ends_at' => $endsAt,
                'status'               => 'active',
                'updated_at'           => now(),
            ]);

        Log::info('activateSubscription: completed', [
            'tenant_id'           => $invoice->tenant_id,
            'new_subscription_id' => $newSubscriptionId,
            'plan'                => $plan->name,
            'billing_cycle'       => $billingCycle,
            'ends_at'             => $endsAt,
        ]);
    }

    /**
 * GET /api/payments
 */
public function index(Request $request)
{
    try {
        $perPage = $request->get('per_page', 15);
        $page    = $request->get('page', 1);
        $search  = $request->get('search');
        $status  = $request->get('status');

        $query = DB::connection('central')
            ->table('payments')
            ->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
            ->join('tenants', 'payments.tenant_id', '=', 'tenants.id')
            ->select(
                'payments.id',
                'payments.order_id',
                'payments.provider',
                'payments.payment_type',
                'payments.transaction_id',
                'payments.gross_amount',
                'payments.status',
                'payments.paid_at',
                'payments.created_at',
                'invoices.invoice_number',
                'invoices.currency',
                'tenants.name as tenant_name',
                'tenants.slug as tenant_slug',
            )
            ->orderBy('payments.created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('payments.order_id', 'ilike', "%{$search}%")
                  ->orWhere('invoices.invoice_number', 'ilike', "%{$search}%")
                  ->orWhere('tenants.name', 'ilike', "%{$search}%")
                  ->orWhere('tenants.slug', 'ilike', "%{$search}%")
                  ->orWhere('payments.transaction_id', 'ilike', "%{$search}%");
            });
        }

        if ($status) {
            $statuses = explode(',', $status);
            $query->whereIn('payments.status', $statuses);
        }

        $total   = $query->count();
        $payments = $query->offset(($page - 1) * $perPage)->limit($perPage)->get();

        return ApiResponse::success($payments, 'Payments retrieved successfully', [
            'total'        => $total,
            'per_page'     => (int) $perPage,
            'current_page' => (int) $page,
            'last_page'    => (int) ceil($total / $perPage),
        ]);

    } catch (\Exception $e) {
        Log::error('Error fetching payments', ['error' => $e->getMessage()]);
        return ApiResponse::error(
            'Failed to fetch payments',
            config('app.debug') ? $e->getMessage() : null,
            500
        );
    }
}

    /**
     * GET /api/payments/{id}
     */
    public function show(string $id)
    {
        try {
            $payment = DB::connection('central')
                ->table('payments')
                ->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
                ->join('tenants', 'payments.tenant_id', '=', 'tenants.id')
                ->leftJoin('subscriptions', 'invoices.subscription_id', '=', 'subscriptions.id')
                ->leftJoin('plans', 'subscriptions.plan_id', '=', 'plans.id')
                ->where('payments.id', $id)
                ->select(
                    'payments.id',
                    'payments.order_id',
                    'payments.provider',
                    'payments.payment_type',
                    'payments.transaction_id',
                    'payments.gross_amount',
                    'payments.status',
                    'payments.raw_response',
                    'payments.paid_at',
                    'payments.created_at',
                    'invoices.id as invoice_id',
                    'invoices.invoice_number',
                    'invoices.currency',
                    'invoices.amount as invoice_amount',
                    'invoices.status as invoice_status',
                    'invoices.issued_at',
                    'invoices.due_date',
                    'tenants.id as tenant_id',
                    'tenants.name as tenant_name',
                    'tenants.slug as tenant_slug',
                    'plans.name as plan_name',
                    'plans.code as plan_code',
                )
                ->first();

            if (!$payment) {
                return ApiResponse::error('Payment not found', null, 404);
            }

            return ApiResponse::success($payment, 'Payment retrieved successfully');

        } catch (\Exception $e) {
            Log::error('Error fetching payment', ['error' => $e->getMessage()]);
            return ApiResponse::error(
                'Failed to fetch payment',
                config('app.debug') ? $e->getMessage() : null,
                500
            );
        }
    }

/**
 * GET /api/invoices
 */
public function indexInvoices(Request $request)
{
    try {
        $perPage = $request->get('per_page', 15);
        $page    = $request->get('page', 1);
        $search  = $request->get('search');
        $status  = $request->get('status');

        $query = DB::connection('central')
            ->table('invoices')
            ->join('tenants', 'invoices.tenant_id', '=', 'tenants.id')
            ->leftJoin('subscriptions', 'invoices.subscription_id', '=', 'subscriptions.id')
            ->leftJoin('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->select(
                'invoices.id',
                'invoices.invoice_number',
                'invoices.external_reference',
                'invoices.amount',
                'invoices.currency',
                'invoices.payment_gateway',
                'invoices.payment_method',
                'invoices.transaction_id',
                'invoices.status',
                'invoices.issued_at',
                'invoices.due_date',
                'invoices.paid_at',
                'invoices.notes',
                'invoices.created_at',
                'tenants.id as tenant_id',
                'tenants.name as tenant_name',
                'tenants.slug as tenant_slug',
                'plans.name as plan_name',
                'plans.code as plan_code',
            )
            ->orderBy('invoices.created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoices.invoice_number', 'ilike', "%{$search}%")
                  ->orWhere('invoices.external_reference', 'ilike', "%{$search}%")
                  ->orWhere('tenants.name', 'ilike', "%{$search}%")
                  ->orWhere('tenants.slug', 'ilike', "%{$search}%");
            });
        }

        if ($status) {
            $statuses = explode(',', $status);
            $query->whereIn('invoices.status', $statuses);
        }

        $total    = $query->count();
        $invoices = $query->offset(($page - 1) * $perPage)->limit($perPage)->get();

        return ApiResponse::success($invoices, 'Invoices retrieved successfully', [
            'total'        => $total,
            'per_page'     => (int) $perPage,
            'current_page' => (int) $page,
            'last_page'    => (int) ceil($total / $perPage),
        ]);

    } catch (\Exception $e) {
        Log::error('Error fetching invoices', ['error' => $e->getMessage()]);
        return ApiResponse::error(
            'Failed to fetch invoices',
            config('app.debug') ? $e->getMessage() : null,
            500
        );
    }
}

/**
 * GET /api/invoices/{id}
 */
public function showInvoice(string $id)
{
    try {
        $invoice = DB::connection('central')
            ->table('invoices')
            ->join('tenants', 'invoices.tenant_id', '=', 'tenants.id')
            ->leftJoin('subscriptions', 'invoices.subscription_id', '=', 'subscriptions.id')
            ->leftJoin('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->leftJoin('payments', 'payments.invoice_id', '=', 'invoices.id')
            ->where('invoices.id', $id)
            ->select(
                'invoices.id',
                'invoices.invoice_number',
                'invoices.external_reference',
                'invoices.amount',
                'invoices.currency',
                'invoices.payment_gateway',
                'invoices.payment_method',
                'invoices.transaction_id',
                'invoices.status',
                'invoices.issued_at',
                'invoices.due_date',
                'invoices.paid_at',
                'invoices.notes',
                'invoices.gateway_response',
                'invoices.created_at',
                'invoices.updated_at',
                'tenants.id as tenant_id',
                'tenants.name as tenant_name',
                'tenants.slug as tenant_slug',
                'tenants.owner_email as tenant_email',
                'subscriptions.id as subscription_id',
                'subscriptions.billing_cycle',
                'subscriptions.status as subscription_status',
                'plans.name as plan_name',
                'plans.code as plan_code',
                'payments.id as payment_id',
                'payments.status as payment_status',
                'payments.payment_type',
                'payments.order_id',
                'payments.gross_amount',
                'payments.transaction_id as payment_transaction_id',
                'payments.paid_at as payment_paid_at',
            )
            ->first();

        if (!$invoice) {
            return ApiResponse::error('Invoice not found', null, 404);
        }

        return ApiResponse::success($invoice, 'Invoice retrieved successfully');

    } catch (\Exception $e) {
        Log::error('Error fetching invoice', ['error' => $e->getMessage()]);
        return ApiResponse::error(
            'Failed to fetch invoice',
            config('app.debug') ? $e->getMessage() : null,
            500
        );
    }
}

}