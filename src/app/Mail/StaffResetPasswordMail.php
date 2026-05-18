<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;
    public $email;
    public $frontendUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($token, $email, $frontendUrl)
    {
        $this->token = $token;
        $this->email = $email;
        $this->frontendUrl = $frontendUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Password Akses Tenant Gym Anda',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.staff_reset_password',
            with: [
                'resetUrl' => rtrim($this->frontendUrl, '/') . '/tenant-auth/reset-password?token=' . $this->token . '&email=' . urlencode($this->email),
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
