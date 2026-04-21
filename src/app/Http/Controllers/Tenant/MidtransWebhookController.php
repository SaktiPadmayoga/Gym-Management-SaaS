<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Services\MemberRegistrationService;
use App\Services\MidtransService;
use App\Services\ClassBookingPaymentService;
use App\Services\FacilityBookingPaymentService;
use App\Services\PtPackagePaymentService; 
use App\Services\POSPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Tenant;
use App\Services\MembershipPaymentService;
use Stancl\Tenancy\Facades\Tenancy;

class MidtransWebhookController extends Controller
{
    // Mapping prefix → service
    private const PREFIX_MAP = [
        'MEM' => 'member',
        'UPG' => 'upgrade',      
        'PTP' => 'pt_package',
        'FCL' => 'facility', 
        'POS' => 'pos', 
    ];

    public function __construct(
        protected MidtransService $midtrans,
        protected MemberRegistrationService $memberService,
        protected MembershipPaymentService $membershipPaymentService,
        protected ClassBookingPaymentService $classService,
        protected PtPackagePaymentService $ptPackageService,
        protected FacilityBookingPaymentService $facilityService, 
        protected POSPaymentService $posService,
    ) {}

    /**
     * POST /api/tenant/webhook/midtrans
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $orderId = $payload['order_id'] ?? null;

        Log::info('[Webhook] Diterima', [
            'order_id' => $orderId,
            'status'   => $payload['transaction_status'] ?? null,
        ]);

        // 1. Validasi Signature Midtrans
        if (!$this->midtrans->validateSignature(
            orderId:           $payload['order_id'] ?? '',
            statusCode:        $payload['status_code'] ?? '',
            grossAmount:       $payload['gross_amount'] ?? '',
            incomingSignature: $payload['signature_key'] ?? '',
        )) {
            Log::warning('[Webhook] Signature tidak valid', ['order_id' => $orderId]);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        // 2. Cari Tenant
        $foundTenant = null;

        foreach (Tenant::all() as $tenant) {
            tenancy()->initialize($tenant);

            $exists = \App\Models\Tenant\TenantInvoice::where('invoice_number', $orderId)
                ->orWhere('external_reference', $orderId)
                ->exists();

            if ($exists) {
                $foundTenant = $tenant;
                break;
            }
        }

        if (!$foundTenant) {
            Log::error('[Webhook] Invoice tidak ditemukan di tenant manapun', ['order_id' => $orderId]);
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        // 3. Tentukan service berdasarkan prefix order_id
        $prefix = $this->extractPrefix($orderId);
        $service = $this->resolveService($prefix);

        if (!$service) {
            Log::error('[Webhook] Prefix tidak dikenali', ['order_id' => $orderId, 'prefix' => $prefix]);
            return response()->json(['message' => 'Unknown order prefix'], 422);
        }

        // 4. Proses sesuai status pembayaran
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus       = $payload['fraud_status'] ?? null;

        try {
            if ($this->isSuccessfulPayment($transactionStatus, $fraudStatus)) {
                Log::info('[Webhook] Memproses pembayaran SUKSES', ['order_id' => $orderId, 'prefix' => $prefix]);
                $service->confirmPayment($payload);

            } elseif ($this->isFailedPayment($transactionStatus)) {
                $paymentStatus = match ($transactionStatus) {
                    'expire' => 'expired',
                    default  => 'failed',
                };
                Log::info('[Webhook] Memproses pembayaran GAGAL', [
                    'order_id' => $orderId,
                    'prefix'   => $prefix,
                    'status'   => $paymentStatus
                ]);
                $service->handleFailedPayment($payload, $paymentStatus);

            } else {
                Log::info('[Webhook] Status diabaikan', ['status' => $transactionStatus]);
            }
        } catch (\Throwable $e) {
            Log::error('[Webhook] Error saat memproses payment', [
                'order_id' => $orderId,
                'error'    => $e->getMessage()
            ]);
        }

        return response()->json(['message' => 'OK'], 200);
    }

    // ==================================================================
    // PRIVATE HELPERS
    // ==================================================================

    /**
     * Ekstrak prefix dari order_id (Format: INV-PTP-20260417-ABCDEF -> "PTP")
     */
    private function extractPrefix(?string $orderId): ?string
    {
        if (!$orderId) return null;

        $parts = explode('-', $orderId);
        return $parts[1] ?? null; 
    }

    /**
     * Resolve service berdasarkan prefix
     */
    private function resolveService(?string $prefix): mixed
    {
        return match (self::PREFIX_MAP[$prefix] ?? null) {
            'member'     => $this->memberService,
            'upgrade'    => $this->membershipPaymentService,
            'class'      => $this->classService,
            'pt_package' => $this->ptPackageService,
            'facility'   => $this->facilityService, 
            'pos'        => $this->posService,
            default      => null,
        };
    }

    private function isSuccessfulPayment(string $transactionStatus, ?string $fraudStatus): bool
    {
        if ($transactionStatus === 'settlement') {
            return true;
        }

        if ($transactionStatus === 'capture') {
            return in_array($fraudStatus, ['accept', null, '']);
        }

        return false;
    }

    private function isFailedPayment(string $transactionStatus): bool
    {
        return in_array($transactionStatus, ['expire', 'deny', 'cancel', 'failure']);
    }
}