<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\Wealth\SyncMarketAssetsAction;
use Exception;
use Illuminate\Console\Command;

class MarketSyncCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'market:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize market-linked assets (Gold, etc.) with real-time rates.';

    /**
     * Execute the console command.
     */
    public function handle(SyncMarketAssetsAction $syncMarketAssetsAction): int
    {
        try {
            $this->info('Starting Proactive Market Sentinel Pulse...');
            $stats = $syncMarketAssetsAction->execute();

            $this->info("Market sync completed: {$stats['updated']} assets updated.");

            if ($stats['alerts'] > 0) {
                $this->warn("Sentinel Triggered: {$stats['alerts']} significant wealth shifts detected!");
            }

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
