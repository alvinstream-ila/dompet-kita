<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use App\Enums\TransactionType;
use Illuminate\Console\Command;

class BudgetCheck extends Command
{
    protected $signature = 'app:budget-check {user} {limit}';
    protected $description = 'Check the monthly budget for a specific user';

    public function handle()
    {
        $user = $this->argument('user');
        $limit = (float) $this->argument('limit');

        $currentSpending = Transaction::where('type', TransactionType::EXPENSE)
            ->sum('amount');

        $percentage = ($currentSpending / $limit) * 100;

        $this->info("### 🛡️ Budget Guard for $user");
        $this->line("**Pengeluaran Saat Ini:** Rp " . number_format($currentSpending, 0, ',', '.'));
        $this->line("**Limit:** Rp " . number_format($limit, 0, ',', '.'));
        $this->line("**Status:** " . number_format($percentage, 1) . "% terpakai.");

        if ($percentage >= 100) {
            $this->error("\n🚨 **CRITICAL: Budget terlampaui!** Sebaiknya istirahat belanja dulu ya.");
        } elseif ($percentage >= 90) {
            $this->warn("\n⚠️ **WARNING: Sudah mendekati limit!** Hati-hati ya.");
        } else {
            $this->info("\n✅ Aman! Silakan lanjutkan rencana produktif kalian.");
        }
    }
}
