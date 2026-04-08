<?php

declare(strict_types=1);

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Models\User;
use App\Services\FinancialIntelligenceService;
use App\Services\GeminiService;
use Exception;
use Illuminate\Support\Facades\Log;

class GuardianAnalyzeAction extends BaseAction
{
    public function __construct(
        private readonly FinancialIntelligenceService $intel,
        private readonly GeminiService $gemini
    ) {}

    /**
     * Execute the liquidity analysis and return results with AI advice if needed.
     *
     * @return array{
     *     status: string,
     *     current_cash: float,
     *     burn_rate: float,
     *     days_remaining: float,
     *     message: string,
     *     ai_advice: ?string,
     *     opportunities: array<int, array{action: string, reason: string}>
     * }
     *
     * @throws Exception
     */
    public function execute(User $user): array
    {
        try {
            // 1. Predict Crisis
            $prediction = $this->intel->predictLiquidityCrisis($user);

            $result = [
                'status' => (string) $prediction['status'],
                'current_cash' => (float) $prediction['current_cash'],
                'burn_rate' => (float) $prediction['burn_rate'],
                'days_remaining' => (float) $prediction['days_remaining'],
                'message' => (string) $prediction['message'],
                'ai_advice' => null,
                'opportunities' => [],
            ];

            if ($result['status'] !== 'safe') {
                // 2. Consult AI if status is not safe
                $advicePrompt = sprintf(
                    'Guardian AI Alert! Status for user %s is %s. Current cash: Rp %s. Daily burn rate: Rp %s. Cash will run out in approx %s days. Provide 1 immediate action to fix this and 1 preventive step in Indonesian (Elegant & Tactical).',
                    $user->name,
                    $result['status'],
                    number_format($result['current_cash']),
                    number_format($result['burn_rate']),
                    $result['days_remaining']
                );

                $result['ai_advice'] = $this->gemini->analyzeFinancials($advicePrompt);

                // Log critical event
                Log::channel('single')->warning("CRITICAL LIQUIDITY ALERT - User {$user->id}: {$result['message']}");
            } else {
                // Check Rebalancing opportunities if safe
                /** @var array<int, array{action: string, amount?: float, reason: string}> $rebalancing */
                $rebalancing = $this->intel->generateRebalanceAdvice($user);
                
                /** @var array<int, array{action: string, reason: string}> $opportunities */
                $opportunities = array_values(array_filter($rebalancing, fn ($adv) => $adv['action'] === 'INVEST'));
                $result['opportunities'] = $opportunities;
            }

            return $result;
        } catch (Exception $e) {
            Log::error("Guardian Analysis Failed for User {$user->id}: ".$e->getMessage());
            throw $e;
        }
    }
}
