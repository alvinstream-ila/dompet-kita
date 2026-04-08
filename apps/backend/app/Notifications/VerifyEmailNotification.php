<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Log;

class VerifyEmailNotification extends VerifyEmail
{
    public string $verificationUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $verificationUrl)
    {
        $this->verificationUrl = $verificationUrl;
    }

    /**
     * Get the verification URL for the given notifiable.
     *
     * @param  mixed  $notifiable
     * @return string
     */
    protected function verificationUrl($notifiable)
    {
        return $this->verificationUrl;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        Log::info('Sending PREMIUM verification email to: '.$notifiable->email);

        return (new MailMessage)
            ->subject('Verifikasi Email Dompet Kita ✨')
            ->view('emails.verify-email', [
                'verificationUrl' => $this->verificationUrl($notifiable),
                'notifiable' => $notifiable,
            ]);
    }
}
