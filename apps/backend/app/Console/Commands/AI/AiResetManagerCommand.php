<?php

declare(strict_types=1);

namespace App\Console\Commands\AI;

use App\Services\AI\AiProviderManager;
use Illuminate\Console\Command;

class AiResetManagerCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:reset-manager';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Force reset the state of AI Provider Manager (clear quarantine)';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->info('🔄 Resetting AI Provider Manager state...');

        $manager = app(AiProviderManager::class);
        $manager->forceReset();

        $this->info('✅ All quarantines and failure counters have been cleared.');
    }
}
