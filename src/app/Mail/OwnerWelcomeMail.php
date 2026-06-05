<?php

namespace App\Mail;

use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OwnerWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $tenant;
    public $ownerName;
    public $ownerEmail;
    public $loginUrl;
    public $planName;
    public $status; // 'trial' or 'paid'

    /**
     * Create a new message instance.
     */
    public function __construct(Tenant $tenant, string $ownerName, string $ownerEmail, string $loginUrl, string $planName, string $status)
    {
        $this->tenant = $tenant;
        $this->ownerName = $ownerName;
        $this->ownerEmail = $ownerEmail;
        $this->loginUrl = $loginUrl;
        $this->planName = $planName;
        $this->status = $status;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $planType = $this->status === 'trial' ? 'Trial' : 'Berlangsung';
        return new Envelope(
            subject: "Selamat Datang di GYMFIT! Akun Gym '{$this->tenant->name}' Berhasil Dibuat ({$planType})",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.owner_welcome',
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
