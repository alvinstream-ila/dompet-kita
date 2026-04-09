<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class ResetPasswordOTPNotification extends Notification
{
    use Queueable;

    public string $code;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $code)
    {
        $this->code = $code;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        Log::info('Sending PREMIUM OTP reset password email to: '.$notifiable->email);

        return (new MailMessage)
            ->subject('🔐 Reset Password Dompet Kita ✨')
            ->view('emails.reset-password', [
                'code' => $this->code,
                'notifiable' => $notifiable,
            ]);
    }
}
