<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\CheckBudgetLimitsAction;
use Exception;
use Illuminate\Console\Command;

class BudgetCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:budget-check {user} {limit}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check budget limits and spending status';

    /**
     * Execute the console command.
     */
    public function handle(CheckBudgetLimitsAction $action): int
    {
        try {
            $user = $this->argument('user');
            $limit = (float) $this->argument('limit');

            $result = $action->execute($user, $limit);

            $this->info("### 🛡️ Budget Guard for {$user}");
            $this->line('**Pengeluaran Saat Ini:** Rp '.number_format($result['spending'], 0, ',', '.'));
            $this->line('**Limit:** Rp '.number_format($result['limit'], 0, ',', '.'));
            $this->line('**Status:** '.number_format($result['percentage'], 1).'% terpakai.');

            $this->newLine();

            match ($result['status']) {
                'critical' => $this->error('🚨 **CRITICAL: Budget terlampaui!** Sebaiknya istirahat belanja dulu ya.'),
                'warning' => $this->warn('⚠️ **WARNING: Sudah mendekati limit!** Hati-hati ya.'),
                default => $this->info('✅ Aman! Silakan lanjutkan rencana produktif kalian.'),
            };

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
