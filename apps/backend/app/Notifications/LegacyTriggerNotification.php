<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LegacyTriggerNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        protected User $user,
        /** @var array<string, mixed> */
        protected array $reportData
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
        if (! $notifiable instanceof User) {
            return (new MailMessage)->subject('Premium Notification');
        }

        $financialSummary = (array) ($this->reportData['financial_summary'] ?? []);
        $totalAssets = number_format((float) ($financialSummary['total_assets'] ?? 0), 0, ',', '.');
        $totalLoans = number_format((float) ($financialSummary['total_loans'] ?? 0), 0, ',', '.');

        return (new MailMessage)
            ->subject('Dompet Kita: Laporan Warisan Digital & Snapshot Keuangan')
            ->greeting("Halo {$notifiable->name},")
            ->line("Sistem 'Dead Man's Switch' Dompet Kita mendeteksi bahwa akun {$this->user->name} sudah tidak aktif selama lebih dari ".($this->user->legacy_threshold_months ?? 6).' bulan.')
            ->line('Sebagai orang yang dipercaya, berikut adalah ringkasan aset yang terdaftar:')
            ->line("- **Total Aset Terdaftar:** Rp {$totalAssets}")
            ->line("- **Total Hutang/Pinjaman Aktif:** Rp {$totalLoans}")
            ->action('Lihat Detail Warisan Digital', url('/ai/legacy/vault'))
            ->line('Pesan ini dikirim secara otomatis untuk memastikan keamanan finansial orang-orang tercinta.')
            ->line('Tetap semangat dan jaga kesehatan ya, Sayang! ❤️');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'legacy_snapshot',
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'summary' => $this->reportData['financial_summary'] ?? [],
        ];
    }
}
