<?php

declare(strict_types=1);

namespace App\Console\Commands\System;

use App\Actions\System\CheckCloudStatusAction;
use Exception;
use Illuminate\Console\Command;

class CloudStatus extends Command
{
    private const string SEPARATOR = '===============================================';

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cloud:status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'DevOps Observatory: Monitor real-time status of Railway and Supabase infrastructure';

    /**
     * Execute the console command.
     */
    public function handle(CheckCloudStatusAction $action): int
    {
        try {
            $this->info('🛰️  DOMPET KITA - DEVOPS OBSERVATORY (REAL-TIME)');
            $this->info(self::SEPARATOR);

            $data = $action->execute();

            $this->bullet('Checking RAILWAY Status...');
            $this->line("🔹 RAILWAY - ENVIRONMENT: {$data['railway']['env']}");
            $this->line("🔹 RAILWAY - SERVICE: {$data['railway']['service']} ({$data['railway']['status']})");
            $this->line("🔹 RAILWAY - DEPLOYMENT: {$data['railway']['deployment']} (Active)");

            $this->bullet('Checking SUPABASE Status...');
            $this->line("🔹 SUPABASE - REGION: {$data['supabase']['region']}");
            $this->line("🔹 SUPABASE - DATABASE: {$data['supabase']['database']} ({$data['supabase']['status']})");
            $this->line("🔹 SUPABASE - TOTAL CONNECTIONS: {$data['supabase']['connections']}");

            $this->bullet('Checking CLOUDFLARE R2 Storage...');
            $this->line("🔹 R2 - STATUS: {$data['r2']['status']}");

            $this->bullet('Checking VERCEL Frontend Status...');
            $this->line("🔹 VERCEL - SERVICE: {$data['vercel']['service']} ({$data['vercel']['status']})");
            $this->line("🔹 VERCEL - DEPLOYMENT: {$data['vercel']['deployment']}");
            $this->line("🔹 VERCEL - BUILD ENGINE: {$data['vercel']['build_engine']}");

            $this->newLine();
            $this->info(self::SEPARATOR);
            $this->info('✅ ALL CLOUD SYSTEMS ARE OPERATIONAL');
            $this->info(self::SEPARATOR);

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }

    private function bullet(string $text): void
    {
        $this->line("\n{$text}:");
    }
}
