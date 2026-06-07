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
    public ?string $pdfBase64 = null;

    /**
     * Create a new message instance.
     */
    public function __construct(TenantInvoice $invoice, ?string $pdfBase64 = null)
    {
        $this->invoice = $invoice;
        $this->pdfBase64 = $pdfBase64;
        
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
        if ($this->pdfBase64) {
            $data = $this->pdfBase64;
            if (preg_match('/^data:application\/pdf;base64,(.*)$/s', $data, $matches)) {
                $data = $matches[1];
            }
            
            return [
                \Illuminate\Mail\Mailables\Attachment::fromData(
                    fn () => base64_decode($data),
                    $this->invoice->invoice_number . '.pdf',
                    'application/pdf'
                )
            ];
        }

        try {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('emails.invoice_receipt', [
                'invoice' => $this->invoice,
                'items'   => $this->invoice->items,
                'customerName' => $this->invoice->customerName(),
            ]);

            return [
                \Illuminate\Mail\Mailables\Attachment::fromData(
                    fn () => $pdf->output(),
                    $this->invoice->invoice_number . '.pdf',
                    'application/pdf'
                )
            ];
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('[SendInvoiceReceiptMail] Failed to generate PDF on backend', [
                'invoice_number' => $this->invoice->invoice_number,
                'error'          => $e->getMessage(),
            ]);
        }

        return [];
    }
}
