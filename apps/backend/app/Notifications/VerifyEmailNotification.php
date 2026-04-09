<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Log;

class VerifyEmailNotification extends VerifyEmail
{
    public string $code;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $code)
    {
        $this->code = $code;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        Log::info('Sending PREMIUM OTP verification email to: '.$notifiable->email);

        return (new MailMessage)
            ->subject('🛡️ Kode Verifikasi Dompet Kita ✨')
            ->view('emails.verify-email', [
                'code' => $this->code,
                'notifiable' => $notifiable,
            ]);
    }
}
