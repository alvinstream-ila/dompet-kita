<?php

namespace App\Services;

use App\Models\Asset;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * SelfHealingService: Automated system diagnosis and repair protocol.
 */
class SelfHealingService
{
    public function __construct(protected GeminiService $gemini) {}

    /**
     * Run system-wide health check.
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
        $negativeAssets = Asset::where('value', '<', 0)->count();
        if ($negativeAssets > 0) {
            $issues[] = ['type' => 'data_anomaly', 'details' => "Found {$negativeAssets} negative assets."];
        }

        return [
            'status' => empty($issues) ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'issues' => $issues,
            'message' => empty($issues)
                ? 'Semua aman ya Sayang, sistem sehat walafiat! ✨'
                : 'Aduh Sayang, ada sedikit kendala di sistem nih. Tenang, aku coba bantu ya! 🥺',
        ];
    }

    /**
     * Get deep AI diagnosis for a set of logs or errors.
     * Fixed signature redundancy (removed $gemini parameter).
     */
    public function getAiDeepDiagnosis(string $context): string
    {
        $prompt = "Kamu adalah Sayang AI, pendamping finansial cerdas. Analisis log sistem berikut dan berikan diagnosa serta solusi teknis yang mudah dipahami (namun tetap menyertakan langkah perbaikan): \n\n".$context;

        try {
            return $this->gemini->generateText($prompt);
        } catch (\Exception $e) {
            Log::error('SelfHealing AI Error: '.$e->getMessage());

            return 'Maaf Sayang, aku lagi kurang enak badan (AI Error). Coba cek log manual dulu ya? 🥺';
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
}
