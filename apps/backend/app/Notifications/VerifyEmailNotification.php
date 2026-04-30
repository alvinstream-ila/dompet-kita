<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Log;

class VerifyEmailNotification extends VerifyEmail
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public string $code)
    {
    }

    /**
     * Get the mail representation of the notification.
     */
    #[\Override]
    public function toMail(mixed $notifiable): MailMessage
    {
        if ($notifiable instanceof User) {
            Log::info('Sending PREMIUM OTP verification email to: '.$notifiable->email);
        }

        return (new MailMessage)
            ->subject('Kode Verifikasi Dompet Kita')
            ->view('emails.verify-email', [
                'code' => $this->code,
                'notifiable' => $notifiable,
            ]);
    }
}
