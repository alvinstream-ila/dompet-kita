<?php

namespace App\Console\Commands;

use App\Models\Asset;
use App\Models\Goal;
use App\Models\Loan;
use App\Models\Transaction;
use Illuminate\Console\Command;
use Carbon\Carbon;

class WealthStatus extends Command
{
    protected $signature = 'app:wealth-status';
    protected $description = 'A professional financial dashboard directly in your CLI terminal';

    public function handle()
    {
        $this->info("### 💎 Dompet Kita - Financial Dashboard");
        $this->info("Date: " . Carbon::now()->toFormattedDateString());
        $this->newLine();

        // 1. Transaction Summary (This Month)
        $income = Transaction::where('type', 'income')->whereMonth('date', Carbon::now()->month)->sum('amount');
        $expense = Transaction::where('type', 'expense')->whereMonth('date', Carbon::now()->month)->sum('amount');
        
        $this->info("📈 [ MONTHLY SUMMARY ]");
        $this->table(
            ['Type', 'Amount (IDR)'],
            [
                ['Total Income', number_format($income)],
                ['Total Expense', number_format($expense)],
                ['Net Savings', number_format($income - $expense)]
            ]
        );
        $this->newLine();

        // 2. Asset & Goals Status
        $totalAssets = Asset::sum('value');
        $totalGoals = Goal::sum('current_amount');
        
        $this->info("🏦 [ ASSETS & GOALS ]");
        $this->table(
            ['Category', 'Current Value'],
            [
                ['Net Assets', number_format($totalAssets)],
                ['Mimpi Kita (Goals)', number_format($totalGoals)],
                ['Total Wealth', number_format($totalAssets + $totalGoals)]
            ]
        );
        $this->newLine();

        // 3. Loans & Debts
        $debts = Loan::where('type', 'utang')->sum('remaining_amount');
        $receivables = Loan::where('type', 'piutang')->sum('remaining_amount');

        $this->info("🤝 [ LOANS & DEBTS ]");
        $this->table(
            ['Category', 'Total Amount'],
            [
                ['Utang (Our Debt)', number_format($debts)],
                ['Piutang (Owed to Us)', number_format($receivables)],
                ['Net Obligations', number_format($receivables - $debts)]
            ]
        );

        $this->newLine();
        $this->info("========================================");
        $this->info("📊  Dashboard Generated Successfully! Have a great day, Alvin & Ila!");
        $this->info("========================================");

        return 0;
    }
}
