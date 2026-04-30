<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class ResetPasswordOTPNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public string $code)
    {
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
        if ($notifiable instanceof User) {
            Log::info('Sending PREMIUM OTP reset password email to: '.$notifiable->email);
        }

        return (new MailMessage)
            ->subject('Reset Password Dompet Kita')
            ->view('emails.reset-password', [
                'code' => $this->code,
                'notifiable' => $notifiable,
            ]);
    }
}
