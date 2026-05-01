<?php

declare(strict_types=1);

namespace App\Actions\AI\Cognitive;

use App\Actions\AI\ChatWithAiAction;
use App\Models\FinancialWisdom;
use App\Models\User;
use App\Services\FinancialIntelligenceService;
use Illuminate\Support\Facades\Log;

class GenerateWisdomAction
{
    public function __construct(protected ChatWithAiAction $chatWithAiAction, protected FinancialIntelligenceService $finIntel) {}

    /**
     * Generate a proactive financial insight for a user.
     */
    public function execute(User $user): ?FinancialWisdom
    {
        try {
            // Can be decoupled further eventually, using it via DI for now.
            $prediction = $this->finIntel->predictLiquidityCrisis($user);
            $rebalance = $this->finIntel->generateRebalanceAdvice($user);

            $prompt = "Role: Sovereign CFO Partner (Elite Institutional Strategist). Berikan 1 kalimat insight bijak dan strategis berdasarkan data berikut:\n";
            $prompt .= "- Likuiditas: {$prediction['status']} (Rp ".number_format((float) $prediction['current_cash'], 0, ',', '.').")\n";
            $prompt .= '- Burn rate harian: Rp '.number_format((float) $prediction['burn_rate'], 0, ',', '.')."\n";
            $prompt .= "- Sisa hari dana: {$prediction['days_remaining']} hari\n";
            $prompt .= '- Saran Rebalance: '.count($rebalance)." saran aktif.\n";
            $prompt .= "Fokus pada efisiensi modal dan mitigasi risiko. Gunakan nada bicara elit, tenang, dan data-driven. JANGAN gunakan kata 'Sayang' atau bahasa kasual. NO EMOJIS.";

            $wisdomText = $this->chatWithAiAction->execute($prompt, '');

            return FinancialWisdom::create([
                'user_id' => $user->id,
                'type' => strtolower($prediction['status']) === 'safe' ? 'insight' : 'warning',
                'content' => $wisdomText,
                'metadata' => [
                    'cash' => $prediction['current_cash'],
                    'burn_rate' => $prediction['burn_rate'],
                    'days_remaining' => $prediction['days_remaining'],
                    'rebalance_count' => count($rebalance),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('GenerateWisdomAction Error: '.$e->getMessage());

            return null;
        }
    }
}
