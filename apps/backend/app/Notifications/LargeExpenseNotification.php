<?php

namespace App\Notifications;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LargeExpenseNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        protected Transaction $transaction,
        protected User $spender
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
        $amount = number_format($this->transaction->amount, 0, ',', '.');

        return (new MailMessage)
            ->subject('Lansiran Keamanan: Deteksi Pengeluaran Anomali/Signifikan')
            ->greeting('Pemberitahuan Protokol CFO')
            ->line('Sistem telah mencatat pengeluaran dengan nominal signifikan dari entitas '.$this->spender->name.' pada akun Ledger Bersama.')
            ->line('Pemberitahuan ini dikirimkan untuk memastikan sinkronisasi data finansial antar partner:')
            ->line('**Detail Transaksi:**')
            ->line('- **Jumlah:** Rp '.$amount)
            ->line('- **Kategori:** '.$this->transaction->category)
            ->line('- **Catatan:** '.($this->transaction->note ?? 'Tidak ada catatan'))
            ->action('Cek Detail di Aplikasi', url('/transactions'))
            ->line('Verifikasi transaksi ini untuk menjaga integritas likuiditas rumah tangga.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'transaction_id' => $this->transaction->id,
            'spender_name' => $this->spender->name,
            'amount' => $this->transaction->amount,
            'category' => $this->transaction->category,
            'type' => 'large_expense',
            'message' => 'Deteksi pengeluaran anomali sebesar Rp '.number_format($this->transaction->amount).' oleh entitas '.$this->spender->name,
        ];
    }
}
