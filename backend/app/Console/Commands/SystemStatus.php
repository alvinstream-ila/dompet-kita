<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use App\Models\Asset;
use App\Models\Goal;
use App\Models\Loan;
use App\Enums\TransactionType;
use Illuminate\Console\Command;

class SystemStatus extends Command
{
    protected $signature = 'app:status';
    protected $description = 'Comprehensive Financial Snapshot Dashboard';

    public function handle()
    {
        $this->info("========================================");
        $this->info("🏠 DOMPET KITA - COMMAND CENTER STATUS");
        $this->info("========================================");

        // 1. Balance Summary
        $income = Transaction::where('type', TransactionType::INCOME)->sum('amount');
        $expense = Transaction::where('type', TransactionType::EXPENSE)->sum('amount');
        $this->info("💳 SALDO: Rp " . number_format($income - $expense, 0, ',', '.'));

        // 2. Assets
        $assets = Asset::sum('value');
        $this->info("💰 ASET: Rp " . number_format($assets, 0, ',', '.'));

        // 3. Loans
        $loans = Loan::where('status', '!=', 'paid')->sum('amount');
        if ($loans > 0) {
            $this->error("🏦 PINJAMAN AKTIF: Rp " . number_format($loans, 0, ',', '.'));
        } else {
            $this->info("🏦 PINJAMAN AKTIF: Rp 0 (Semua Lunas!)");
        }

        // 4. Goals Header
        $this->line("\n--- TARGET TABUNGAN ---");
        $goals = Goal::take(3)->get();
        foreach ($goals as $goal) {
            $percent = ($goal->current_amount / $goal->target_amount) * 100;
            $this->line("🎯 {$goal->name}: " . number_format($percent, 0) . "%");
        }

        $this->info("\n========================================");
        $this->info("✅ All systems ready!");
    }
}
