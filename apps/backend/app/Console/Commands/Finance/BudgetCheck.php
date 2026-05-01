<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\CheckBudgetLimitsAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class BudgetCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:budget-check {user_id} {limit}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check current-month budget limits and spending status for a user (pass User ID)';

    /**
     * Execute the console command.
     */
    public function handle(CheckBudgetLimitsAction $action): int
    {
        try {
            $userId = $this->argument('user_id');
            $limit = (float) $this->argument('limit');

            $user = User::find($userId);

            if (! $user instanceof User) {
                $this->error("User with ID [{$userId}] not found.");

                return 1;
            }

            $result = $action->execute($user, $limit);

            $this->info("### 🛡️ Budget Guard for {$user->name}");
            $this->line('**Pengeluaran Bulan Ini:** Rp '.number_format($result['spending'], 0, ',', '.'));
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
