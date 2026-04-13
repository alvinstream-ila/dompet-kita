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
        $frontendUrl = config('app.frontend_url') ?? 'http://localhost:3000';
        $acceptUrl = $frontendUrl.'/accept-invite?token='.$this->token;

        return (new MailMessage)
            ->subject('💌 Ssst! Ada Undangan Spesial dari '.$this->inviter->name)
            ->greeting('Halo Sayang! ❤️')
            ->line($this->inviter->name.' baru saja mengundang kamu untuk menghubungkan akun di Dompet Kita.')
            ->line('Dengan sinkronisasi ini, kalian bisa saling memantau pengeluaran besar dan mengatur masa depan bersama jadi lebih terencana.')
            ->line('Gak perlu khawatir, data harianmu tetap pribadi kok! Ini cuma buat kita tetap kompak.')
            ->action('Terima Undangan ✨', $acceptUrl)
            ->line('Tetap semangat membangun mimpi bareng ya! ✨');
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
            'message' => $this->inviter->name.' mengundang kamu jadi partner keuangan! 💖',
        ];
    }
}
