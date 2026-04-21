<?php

namespace App\Services;

use App\Models\Tenant\TenantInvoice;
use App\Models\Tenant\FacilityBooking;
use Illuminate\Support\Facades\DB;

class FacilityBookingPaymentService
{
    public function confirmPayment(array $payload): void
    {
        DB::transaction(function () use ($payload) {
            $invoice = TenantInvoice::where('invoice_number', $payload['order_id'])->first();
            if (!$invoice || $invoice->status === 'paid') return;

            $invoice->update([
                'status' => 'paid',
                'paid_at' => now(),
                'gateway_response' => json_encode($payload)
            ]);

            FacilityBooking::where('tenant_invoice_id', $invoice->id)->update(['payment_status' => 'paid']);
        });
    }

    public function handleFailedPayment(array $payload, string $status): void
    {
        DB::transaction(function () use ($payload, $status) {
            $invoice = TenantInvoice::where('invoice_number', $payload['order_id'])->first();
            if (!$invoice || $invoice->status === 'paid') return;

            $invoice->update(['status' => $status]);
            
            FacilityBooking::where('tenant_invoice_id', $invoice->id)->update([
                'status' => 'cancelled',
                'payment_status' => $status,
            ]);
        });
    }
}