<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\GetFinancialReportAction;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;

class FinancialReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:financial-report {month? : Month in YYYY-MM format}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a summary of the financial status';

    /**
     * Execute the console command.
     */
    public function handle(GetFinancialReportAction $action): int
    {
        try {
            $monthStr = $this->argument('month') ?: Carbon::now()->format('Y-m');
            $defaultUser = User::find(1);

            $result = $action->execute((string) $monthStr, $defaultUser);

            $this->info("### 📑 Monthly Report: {$result['month_name']}");
            $this->line('**Total Income:** Rp '.number_format($result['income'], 0, ',', '.'));
            $this->line('**Total Expense:** Rp '.number_format($result['expense'], 0, ',', '.'));
            $this->line('**Net:** Rp '.number_format($result['net'], 0, ',', '.'));

            $this->info("\n**Top Spending:**");
            if ($result['top_spending']->isEmpty()) {
                $this->line('  (No expenses recorded)');
            } else {
                foreach ($result['top_spending'] as $t) {
                    $this->line("- {$t->description}: Rp ".number_format($t->amount, 0, ',', '.'));
                }
            }

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
