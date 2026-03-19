<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Log;

class VerifyEmailNotification extends VerifyEmail implements ShouldQueue
{
    use Queueable;

    public $verificationUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct($verificationUrl)
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
        Log::info('Sending verification email to: ' . $notifiable->email);

        return (new MailMessage)
            ->subject('Verifikasi Email Dompet Kita ✨')
            ->greeting('Halo sayang! ❤️')
            ->line('Klik tombol di bawah ini buat verifikasi email kamu ya, biar kita bisa mulai nabung bareng! 💰')
            ->action('Verifikasi Email Sekarang', $this->verificationUrl($notifiable))
            ->line('Kalau kamu nggak merasa daftar di Dompet Kita, cuekin aja pesan ini ya sayang.')
            ->salutation('Cintamu, Dompet Kita Team');
    }
}
