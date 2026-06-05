<?php

namespace App\Observers\Tenant;

use App\Mail\SendInvoiceReceiptMail;
use App\Models\Tenant\TenantInvoice;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TenantInvoiceObserver
{
    /**
     * Handle the TenantInvoice "created" event.
     */
    public function created(TenantInvoice $invoice): void
    {
        if ($invoice->isPaid()) {
            $this->sendReceiptEmail($invoice);
        }
    }

    /**
     * Handle the TenantInvoice "updated" event.
     */
    public function updated(TenantInvoice $invoice): void
    {
        // Only trigger if the status has changed to 'paid'
        if ($invoice->isDirty('status') && $invoice->isPaid()) {
            $this->sendReceiptEmail($invoice);
        }
    }

    /**
     * Dispatch the receipt email to the member or guest.
     */
    private function sendReceiptEmail(TenantInvoice $invoice): void
    {
        $recipientEmail = $invoice->member?->email ?? $invoice->guest_email;

        if (!$recipientEmail) {
            Log::info('[InvoiceReceiptObserver] Skipped sending receipt, no recipient email found', [
                'invoice_number' => $invoice->invoice_number,
            ]);
            return;
        }

        try {
            // Send the mail using the queue if configured, falls back to sync
            Mail::to($recipientEmail)->queue(new SendInvoiceReceiptMail($invoice));
            
            Log::info('[InvoiceReceiptObserver] Receipt email queued successfully', [
                'invoice_number' => $invoice->invoice_number,
                'recipient'      => $recipientEmail,
            ]);
        } catch (\Throwable $e) {
            Log::error('[InvoiceReceiptObserver] Failed to queue receipt email', [
                'invoice_number' => $invoice->invoice_number,
                'recipient'      => $recipientEmail,
                'error'          => $e->getMessage(),
            ]);
        }
    }
}
