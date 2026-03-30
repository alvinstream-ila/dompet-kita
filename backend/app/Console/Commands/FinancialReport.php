<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use App\Enums\TransactionType;
use Illuminate\Console\Command;
use Carbon\Carbon;

class FinancialReport extends Command
{
    protected $signature = 'app:financial-report {month?}';
    protected $description = 'Generate a summary of the financial status';

    public function handle()
    {
        $monthStr = $this->argument('month') ?: Carbon::now()->format('Y-m');
        $month = Carbon::parse($monthStr);

        $txs = Transaction::whereMonth('date', $month->month)
            ->whereYear('date', $month->year)
            ->get();

        $income = $txs->where('type', TransactionType::INCOME)->sum('amount');
        $expense = $txs->where('type', TransactionType::EXPENSE)->sum('amount');

        $this->info("### 📑 Monthly Report: " . $month->format('F Y'));
        $this->line("**Total Income:** Rp " . number_format($income, 0, ',', '.'));
        $this->line("**Total Expense:** Rp " . number_format($expense, 0, ',', '.'));
        $this->line("**Net:** Rp " . number_format($income - $expense, 0, ',', '.'));

        $this->info("\n**Top Spending:**");
        $topSpending = $txs->where('type', TransactionType::EXPENSE)
            ->sortByDesc('amount')
            ->take(5);

        foreach ($topSpending as $t) {
            $this->line("- {$t->description}: Rp " . number_format($t->amount, 0, ',', '.'));
        }
    }
}
