<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PartnerInvitationNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        protected User $inviter,
        protected string $token
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
        $frontendUrl = (string) (config('app.frontend_url') ?? 'http://localhost:3000');
        $acceptUrl = $frontendUrl.'/accept-invite?token='.$this->token;

        return (new MailMessage)
            ->subject('Undangan Sinkronisasi Partner Finansial dari '.$this->inviter->name)
            ->greeting('Pemberitahuan Aktivasi Partner Finansial')
            ->line($this->inviter->name.' mengundang Anda untuk menghubungkan akun pada platform Dompet Kita.')
            ->line('Melalui sinkronisasi ini, Anda dapat berkolaborasi dalam pemantauan aset dan perencanaan finansial strategis.')
            ->line('Keamanan data tetap terjaga; hanya informasi ringkasan tertentu yang akan dibagikan kepada partner.')
            ->action('Konfirmasi Sinkronisasi 🛡️', $acceptUrl)
            ->line('Pemberitahuan ini dikirim secara otomatis oleh sistem manajemen finansial Dompet Kita.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'partner_invitation',
            'inviter_name' => $this->inviter->name,
            'token' => $this->token,
            'message' => $this->inviter->name.' mengundang Anda sebagai partner manajemen finansial.',
        ];
    }
}
