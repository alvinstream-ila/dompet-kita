<?php

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Models\User;
use App\Services\AI\AiProviderManager;
use App\Services\FinancialIntelligenceService;
use App\Services\Security\PrivacyFilter;
use Illuminate\Support\Facades\Log;

class GenerateInsightAction extends BaseAction
{
    public function __construct(
        protected AiProviderManager $manager,
        protected PrivacyFilter $filter,
        protected FinancialIntelligenceService $intelService
    ) {}

    /**
     * @return array{title: string, insight: string}
     */
    public function execute(string $incomeStr, string $expenseStr, string $savingsStr, string $summaryText): array
    {
        $user = auth()->user();
        if (! $user instanceof User) {
            $user = User::firstOrFail();
        }
        $sovereign = $this->intelService->getSovereignMetrics($user);

        $prompt = <<<PROMPT
Role: Sovereign CFO Partner (Elite Institutional Strategist).
Data Context (Sovereign Snapshot):
- Monthly Cashflow: Rp {$incomeStr} (In) / Rp {$expenseStr} (Out)
- Net Position: Rp {$savingsStr}
- Income Volatility: {$sovereign['income_volatility']} (Coefficient of Variation)
- Expense Volatility: {$sovereign['expense_volatility']}
- Liquidity Ratio: {$sovereign['liquidity_ratio']}x
- Recommendation Framework: {$sovereign['recommendation_framework']}

MANDATORY ANALYSIS LOGIC:
1. Dynamic Cashflow (Volatility): Jika volatilitas tinggi, fokus pada strategi "Consumption Smoothing" (Friedman's PIH) dan "Precautionary Buffers". Jangan menghakimi fluktuasi jika pemasukan rata-rata tinggi (>= 10jt).
2. Capital Efficiency: Evaluasi apakah surplus dikonversi menjadi aset produktif atau mengendap di instrumen non-optimal.
3. Tone: Formal, intelektual, otoritatif. No fluff.

OUTPUT INSTRUCTIONS:
1. Output MUST be valid JSON: {"title": "Strategic CFO Audit", "insight": "Analysis & tactical advice (Max 3 concise sentences)"}
2. NO EMOJIS. NO casual language. NO "Sayang".
PROMPT;

        try {
            $jsonText = $this->manager->generateText($prompt);
        } catch (\Throwable $e) {
            Log::error('AI_INSIGHT_ERROR: '.$e->getMessage());

            return [
                'title' => 'Sovereign Insight ✨',
                'insight' => 'Sistem sedang memproses data transaksi untuk menghasilkan rekomendasi strategis. Mohon tunggu sejenak.',
            ];
        }

        if (preg_match('/\{.*\}/s', $jsonText, $matches)) {
            $jsonText = $matches[0];
        }
        $data = json_decode($jsonText, true);

        if (! is_array($data)) {
            Log::error('AI_INSIGHT_PARSING_FAILED', ['raw' => $jsonText]);

            return [
                'title' => 'Sovereign Insight ✨',
                'insight' => 'Sistem sedang memproses data transaksi untuk menghasilkan rekomendasi strategis. Mohon tunggu sejenak.',
            ];
        }

        return [
            'title' => is_string($data['title'] ?? null) ? (string) $data['title'] : 'Sovereign Intelligence ✨',
            'insight' => is_string($data['insight'] ?? null) ? (string) $data['insight'] : 'Data transaksi telah dianalisis. Semua parameter keuangan berada dalam batas operasional yang ditentukan.',
        ];
    }
}
