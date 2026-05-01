<?php

declare(strict_types=1);

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Models\User;
use App\Services\AI\AiProviderManager;
use App\Services\FinancialIntelligenceService;
use Exception;

class GetWealthAdviceAction extends BaseAction
{
    public function __construct(
        private readonly AiProviderManager $manager,
        private readonly FinancialIntelligenceService $intelService
    ) {}

    /**
     * @param  array{netWorth: float|int, savings: float|int, projected: float|int}  $data
     */
    public function execute(User $user, array $data): string
    {
        $sovereign = $this->intelService->getSovereignMetrics($user);

        $prompt = "Identitas: Anda adalah 'Sovereign Wealth Strategist', konsultan kekayaan visioner dan strategis untuk klien Executive.
            
            Snapshot Kekayaan (Proyeksi 12 Bulan):
            - Net Worth Sekarang: Rp ".number_format($data['netWorth'], 0, ',', '.')."\n"
            .'            - Rata-rata Tabungan: Rp '.number_format($data['savings'], 0, ',', '.')."\n"
            .'            - Estimasi Net Worth (Final): Rp '.number_format($data['projected'], 0, ',', '.')."\n"
            .'            
            Metrik Sovereign (Intelejen Historis):
            - Income Volatility: '.($sovereign['income_volatility'] * 100)."%\n"
            .'            - Expense Volatility: '.($sovereign['expense_volatility'] * 100)."%\n"
            ."            - Liquidity Ratio: {$sovereign['liquidity_ratio']}x
            - Recommendation Framework: {$sovereign['recommendation_framework']}
            
            Prinsip Strategis:
            1. Integritas Ekonomi: Gunakan logika dari Modigliani Life-Cycle Hypothesis (smoothing konsumsi) dan Modern Portfolio Theory (diversifikasi aset).
            2. Analisis Trajektori: Apakah kekayaan tumbuh sehat atau tergerus inflasi/volatilitas?
            3. Fokus Sovereign: Berikan 1 tip strategis untuk optimalisasi modal (misal: 'Cash Smoothing' jika volatil, atau 'Yield Enhancement' jika stabil).
            4. Larangan Mutlak: NO 'Sayang', NO EMOJIS, NO EMOJI, PLAIN TEXT ONLY.
            
            Instructions:
            1. Respond in Indonesian, formal, and analytical.
            2. Maksimal 2 paragraf singkat. Langsung ke inti.";

        try {
            return trim($this->manager->generateText($prompt));
        } catch (Exception) {
            return 'Proyeksi pertumbuhan kekayaan Anda menunjukkan potensi yang signifikan. Konsistensi dalam manajemen aset adalah kunci keberhasilan jangka panjang.';
        }
    }
}
