<?php

namespace App\Mail;

use App\Models\Tenant\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MemberWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $member;
    public $planName;
    public $frontendUrl;
    public $resetToken;

    /**
     * Create a new message instance.
     */
    public function __construct(Member $member, string $planName, string $frontendUrl, ?string $resetToken = null)
    {
        $this->member = $member;
        $this->planName = $planName;
        $this->frontendUrl = $frontendUrl;
        $this->resetToken = $resetToken;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Selamat Datang! Informasi Akun Member & Paket Anda',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $resetUrl = null;
        if ($this->resetToken) {
            $resetUrl = rtrim($this->frontendUrl, '/') . '/member/forgot-password/reset?token=' . $this->resetToken . '&email=' . urlencode($this->member->email);
        }

        return new Content(
            view: 'emails.member_welcome',
            with: [
                'resetUrl' => $resetUrl,
                'dashboardUrl' => rtrim($this->frontendUrl, '/') . '/member/login',
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
