<?php

declare(strict_types=1);

namespace App\Console\Commands\System;

use App\Actions\System\VerifyCloudConnectivityAction;
use Exception;
use Illuminate\Console\Command;

class CloudSync extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cloud:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify connectivity between Local, Supabase, and R2 Cloud';

    /**
     * Execute the console command.
     */
    public function handle(VerifyCloudConnectivityAction $action): int
    {
        try {
            $this->info('Verifying Cloud Connectivity...');

            $results = $action->execute();

            // 1. Supabase Check
            if ($results['supabase']) {
                $this->info('✅ SUPABASE: Connected successfully.');
            } else {
                $this->error('❌ SUPABASE: Connection failed!');
            }

            // 2. R2 Check
            if ($results['r2']) {
                $this->info('✅ R2 CLOUD: Configuration detected and keys verified.');
            } else {
                $this->warn('⚠️ R2 CLOUD: Keys are missing in configuration.');
            }

            // 3. Gemini AI Check
            if ($results['gemini']) {
                $this->info('✅ GEMINI AI: Connected and ready.');
            } else {
                $this->warn('⚠️ GEMINI AI: API key not found in configuration.');
            }

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
