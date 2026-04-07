<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\ProcessScheduledTransactionsAction;
use Exception;
use Illuminate\Console\Command;

class CfoProcess extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cfo:process';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'CFO AI: Process scheduled transactions and automations for all users';

    /**
     * Execute the console command.
     */
    public function handle(ProcessScheduledTransactionsAction $action): int
    {
        try {
            $this->info('🤖 DOMPET KITA - CFO AI SENTINEL (Phase 6)');
            $this->info('========================================');
            $this->comment('Scanning for due scheduled transactions...');

            $processed = $action->execute();

            if ($processed > 0) {
                $this->info("✅ Success: Processed {$processed} scheduled transaction(s).");
            } else {
                $this->comment('No due transactions found at this time.');
            }

            $this->info('========================================');

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
