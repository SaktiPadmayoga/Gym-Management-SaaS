<?php

namespace App\Services;

use App\Models\Tenant\PtPackage;
use App\Models\Tenant\TenantInvoice;
use App\Models\Tenant\TenantPayment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PtPackagePaymentService
{
    /**
     * Konfirmasi pembayaran sukses
     */
    public function confirmPayment(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? null;

        if (!$orderId) return false;

        $invoice = TenantInvoice::where('invoice_number', $orderId)
            ->with(['member'])
            ->first();

        if (!$invoice || $invoice->isPaid()) {
            return false;
        }

        // Cari package berdasarkan invoice_id (bukan relasi langsung jika belum diset di model)
        $package = PtPackage::where('tenant_invoice_id', $invoice->id)->first();

        if (!$package) {
            Log::error('[PTPackage] PtPackage tidak ditemukan untuk invoice', ['invoice_id' => $invoice->id]);
            return false;
        }

        DB::transaction(function () use ($invoice, $package, $payload) {
            $plan = $package->plan; // Ambil relasi plan untuk hitung durasi aktif
            
            // Hitung tanggal kedaluwarsa berdasarkan plan
            $activatedAt = now();
            $expiredAt = null;
            
            if ($plan && $plan->duration > 0) {
                $unit = match($plan->duration_unit) {
                    'year'  => 'years',
                    'month' => 'months',
                    'week'  => 'weeks',
                    default => 'days',
                };
                $expiredAt = $activatedAt->copy()->add($plan->duration, $unit);
            }

            // 1. Aktifkan Package
            $package->update([
                'status'       => 'active',
                'activated_at' => $activatedAt,
                'expired_at'   => $expiredAt,
            ]);

            // 2. Update Invoice
            $invoice->update([
                'status'           => 'paid',
                'payment_method'   => $payload['payment_type'] ?? null,
                'transaction_id'   => $payload['transaction_id'] ?? null,
                'paid_at'          => now(),
                'gateway_response' => $payload,
            ]);

            // 3. Catat Pembayaran
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

            Log::info('[PTPackage] Pembayaran paket PT berhasil', ['package_id' => $package->id]);
        });

        return true;
    }

    /**
     * Handle pembayaran gagal/expired
     */
    public function handleFailedPayment(array $payload, string $paymentStatus): void
    {
        $invoice = TenantInvoice::where('invoice_number', $payload['order_id'])->first();

        if (!$invoice || $invoice->isPaid()) return;

        DB::transaction(function () use ($invoice, $payload, $paymentStatus) {
            
            // Batalkan Package
            PtPackage::where('tenant_invoice_id', $invoice->id)->update([
                'status' => 'cancelled'
            ]);

            // Update Invoice & Payment
            $invoiceStatus = ($paymentStatus === 'expired') ? 'expired' : 'failed';
            $invoice->update(['status' => $invoiceStatus]);

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
        });
    }
}