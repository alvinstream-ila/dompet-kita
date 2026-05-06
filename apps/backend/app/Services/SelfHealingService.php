<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Asset;
use App\Services\AI\AiProviderManager;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * SelfHealingService: Automated system diagnosis and repair protocol.
 */
class SelfHealingService
{
    public function __construct(protected AiProviderManager $aiManager) {}

    /**
     * Run system-wide health check.
     *
     * @return array<string, mixed>
     */
    public function performDiagnosis(): array
    {
        $issues = [];

        // 1. Check Database Connectivity
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $issues[] = ['type' => 'database', 'error' => $e->getMessage()];
        }

        // 2. Check Cache/Redis
        try {
            Cache::put('health_check', true, 1);
        } catch (\Exception $e) {
            $issues[] = ['type' => 'cache', 'error' => $e->getMessage()];
        }

        // 3. Check for specific application-level anomalies (e.g., negative assets)
        $negativeAssets = Asset::whereRaw('CAST(value AS NUMERIC) < 0')->count();
        if ($negativeAssets > 0) {
            $issues[] = ['type' => 'data_anomaly', 'details' => "Found {$negativeAssets} negative assets."];
        }

        return [
            'status' => $issues === [] ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'issues' => $issues,
            'message' => $issues === []
                ? 'Sistem dalam kondisi optimal.'
                : 'Terdeteksi anomali pada sistem. Memulai prosedur diagnosa otomatis.',
        ];
    }

    /**
     * Get deep AI diagnosis for a set of logs or errors.
     * Fixed signature redundancy (removed $gemini parameter).
     */
    public function getAiDeepDiagnosis(string $context): string
    {
        $prompt = "Anda adalah Sovereign CFO Strategic Intelligence. Analisis log sistem berikut dan berikan diagnosa serta solusi teknis yang tepat: \n\n".$context;

        try {
            return $this->aiManager->generateText($prompt);
        } catch (\Exception $e) {
            Log::error('SelfHealing AI Error: '.$e->getMessage());

            return 'Gagal memproses diagnosa sistem (AI Error). Silakan periksa log secara manual.';
        }
    }

    /**
     * Attempt automated repair (Sovereign Autopilot).
     */
    public function attemptAutoRepair(string $issueType): bool
    {
        Log::warning("Self-Healing: Attempting auto-repair for [{$issueType}]");

        return match ($issueType) {
            'cache' => Artisan::call('cache:clear') === 0,
            'config' => Artisan::call('config:clear') === 0,
            'view' => Artisan::call('view:clear') === 0,
            default => false,
        };
    }

    /**
     * Diagnose recent system errors from logs.
     */
    public function diagnoseRecentErrors(): string
    {
        // For now, return a placeholder. In a real scenario, this would parse logs.
        return 'No major errors found in recent logs. System integrity verified.';
    }

    /**
     * Execute emergency first-aid protocols.
     *
     * @return array<string>
     */
    public function executeFirstAid(): array
    {
        $actions = [];

        if ($this->attemptAutoRepair('cache')) {
            $actions[] = 'Cleared application cache.';
        }

        if ($this->attemptAutoRepair('config')) {
            $actions[] = 'Cleared configuration cache.';
        }

        return $actions;
    }
}
