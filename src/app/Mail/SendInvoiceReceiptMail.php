<?php

namespace App\Mail;

use App\Models\Tenant\TenantInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendInvoiceReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public TenantInvoice $invoice;

    /**
     * Create a new message instance.
     */
    public function __construct(TenantInvoice $invoice)
    {
        $this->invoice = $invoice;
        
        // Eager load necessary relationships if they are not already loaded
        $this->invoice->loadMissing(['items', 'member', 'branch']);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $gymName = $this->invoice->branch?->name ?? tenant('name') ?? 'GymFit';
        
        return new Envelope(
            subject: '[' . $gymName . '] Nota Pembayaran - ' . $this->invoice->invoice_number,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice_receipt',
            with: [
                'invoice' => $this->invoice,
                'items'   => $this->invoice->items,
                'customerName' => $this->invoice->customerName(),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
