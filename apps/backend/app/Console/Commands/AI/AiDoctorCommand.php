<?php

namespace App\Console\Commands\AI;

use App\Services\AI\AiProviderManager;
use App\Services\AI\AiProviderInterface;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class AiDoctorCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:doctor {--reset : Reset the quarantine status of all providers}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Audit the health of AI providers and connectivity';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🩺 AI Assistant Doctor: Running Diagnostics...');
        $this->newLine();

        if ($this->option('reset')) {
            $this->call('ai:reset-manager');
        }

        $manager = app(AiProviderManager::class);
        $providers = $manager->getProviders();

        $headers = ['Provider', 'Available', 'Quarantined', 'Status', 'Latency'];
        $rows = [];

        foreach ($providers as $provider) {
            /** @var AiProviderInterface $provider */
            $name = $provider->getName();
            $isAvailable = $provider->isAvailable() ? '✅ YES' : '❌ NO (Check Config)';
            
            $quarantineKey = 'ai_provider_quarantine_' . $name;
            $isQuarantined = Cache::has($quarantineKey) ? '⚠️ YES (Quarantined)' : '✅ NO';

            $status = 'Idle';
            $latency = '-';

            if ($provider->isAvailable() && !Cache::has($quarantineKey)) {
                try {
                    $start = microtime(true);
                    $provider->generateText('Hi');
                    $end = microtime(true);
                    $status = '✅ Healthy';
                    $latency = round(($end - $start), 2) . 's';
                } catch (\Exception $e) {
                    $status = '❌ Failed: ' . substr($e->getMessage(), 0, 50);
                }
            } else {
                $status = 'Skipped';
            }

            $rows[] = [$name, $isAvailable, $isQuarantined, $status, $latency];
        }

        $this->table($headers, $rows);

        $this->newLine();
        $this->info('💡 Tip: If all providers show "Skipped", ensure your .env has keys for GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY.');
    }
}
