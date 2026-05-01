<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\GetWealthStatusAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class WealthStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:wealth-status {--user=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'A professional financial dashboard directly in your CLI terminal';

    /**
     * Execute the console command.
     */
    public function handle(GetWealthStatusAction $action): int
    {
        try {
            $this->info('### 💎 Dompet Kita - Financial Dashboard');

            $userId = $this->option('user');
            if (! $userId) {
                $this->error('User ID required via --user flag.');

                return 1;
            }

            $user = User::find($userId);
            if (! $user instanceof User) {
                $this->error("User with ID {$userId} not found.");

                return 1;
            }

            $data = $action->execute($user);

            $this->info("Date: {$data['month']}");
            $this->newLine();

            // 1. Transaction Summary
            $this->info('📈 [ MONTHLY SUMMARY ]');
            $this->table(
                ['Type', 'Amount (IDR)'],
                [
                    ['Total Income', number_format((float) $data['monthly_summary']['income'])],
                    ['Total Expense', number_format((float) $data['monthly_summary']['expense'])],
                    ['Net Savings', number_format((float) $data['monthly_summary']['net'])],
                ]
            );
            $this->newLine();

            // 2. Asset & Goals Status
            $this->info('🏦 [ ASSETS & GOALS ]');
            $this->table(
                ['Category', 'Current Value'],
                [
                    ['Net Assets', number_format((float) $data['assets_goals']['net_assets'])],
                    ['Mimpi Kita (Goals)', number_format((float) $data['assets_goals']['goals'])],
                    ['Total Wealth', number_format((float) $data['assets_goals']['total_wealth'])],
                ]
            );
            $this->newLine();

            // 3. Loans & Debts
            $this->info('🤝 [ LOANS & DEBTS ]');
            $this->table(
                ['Category', 'Total Amount'],
                [
                    ['Utang (Our Debt)', number_format((float) $data['obligations']['debts'])],
                    ['Piutang (Owed to Us)', number_format((float) $data['obligations']['receivables'])],
                    ['Net Obligations', number_format((float) $data['obligations']['net_obligations'])],
                ]
            );

            $this->newLine();
            $this->info('========================================');
            $this->info('📊  Dashboard Generated Successfully! Have a great day, Alvin & Ila!');
            $this->info('========================================');

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
