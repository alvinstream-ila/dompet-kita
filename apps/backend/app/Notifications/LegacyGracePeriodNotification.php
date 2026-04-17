<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LegacyGracePeriodNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        protected User $user,
        protected int $daysRemaining
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $subject = ($this->daysRemaining === 7)
            ? '⚠️ [PENTING] Masa Tenggang Digital Legacy Vault Dimulai'
            : "⚠️ [PERINGATAN] Vault Digital Anda akan dibuka dalam {$this->daysRemaining} hari";

        return (new MailMessage)
            ->subject($subject)
            ->greeting("Halo {$this->user->name},")
            ->line('Sistem kami mendeteksi Anda sudah lama tidak aktif di Dompet Kita.')
            ->line("Sesuai pengaturan 'Digital Legacy Vault' Anda, masa tenggang (grace period) telah dimulai.")
            ->line("**PENTING:** Jika tidak ada aktivitas dalam {$this->daysRemaining} hari ke depan, akses ke data finansial Anda akan otomatis diberikan kepada pasangan Anda.")
            ->action('Konfirmasi Saya Masih Aktif (Heartbeat)', url(((string) config('app.frontend_url')).'/legacy-vault/heartbeat'))
            ->line('Cukup login atau klik tombol di atas untuk membatalkan proses ini.')
            ->line('Pesan ini dikirim demi keamanan data dan masa depan orang-orang tercinta Anda.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'legacy_grace_period',
            'days_remaining' => $this->daysRemaining,
            'message' => "Vault digital akan dibuka dalam {$this->daysRemaining} hari jika tidak ada aktivitas.",
        ];
    }
}
