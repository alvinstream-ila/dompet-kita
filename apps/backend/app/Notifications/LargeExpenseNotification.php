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
            ->subject('⚠️ Sayang, Ada Pengeluaran Besar Nih!')
            ->greeting('Halo Sayang! ❤️')
            ->line('Aku baru saja mencatat pengeluaran besar dari '.$this->spender->name.' di akun keluarga kita.')
            ->line('Mungkin ini rencana kita bareng, tapi aku tetap kasih tahu ya biar kita tetap sinkron:')
            ->line('**Detail Transaksi:**')
            ->line('- **Jumlah:** Rp '.$amount)
            ->line('- **Kategori:** '.$this->transaction->category)
            ->line('- **Catatan:** '.($this->transaction->note ?? 'Tidak ada catatan'))
            ->action('Cek Detail di Aplikasi', url('/transactions'))
            ->line('Tetap semangat mengelola keuangan kita ya! Aku selalu di sini buat bantu kalian. ✨');
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
            'message' => 'Pengeluaran besar Rp '.number_format($this->transaction->amount).' dari '.$this->spender->name,
        ];
    }
}
