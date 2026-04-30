<?php

namespace App\Actions\AI\Cognitive;

use App\Actions\AI\ChatWithAiAction;
use App\Enums\TransactionType;
use App\Models\ChatHistory;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\User;
use App\Services\FinancialIntelligenceService;

class ProcessChatAction
{
    public function __construct(protected ChatWithAiAction $chatWithAiAction, protected FinancialIntelligenceService $intelService)
    {
    }

    /**
     * Process a chat message with persistent history and cognitive simulation.
     */
    public function execute(User $user, string $userMessage): string
    {
        // 1. Get Conversation History (Last 10 turns for context)
        // Scoped to household automatically via HasHouseholdScope
        $history = ChatHistory::orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse();

        // 2. Prepare Context (Current Financial Status)
        $summary = $this->getFinancialSummaryContext();

        // 3. Detect Simulation Intent (Simple Regex for Amount)
        $simulationContext = '';
        if (preg_match('/(\d+[\d.,]*)\s?(ribu|juta|jt|rb|ratus ribu)/i', $userMessage, $matches)) {
            $amount = $this->parseAmount($matches[0]);
            if ($amount > 0) {
                // Dependency on FinancialIntelligenceService (maybe later this becomes an action too, but for now we inject it)
                $simulation = $this->intelService->simulateFinancialImpact($amount);
                $simulationContext = $this->formatSimulationResult($simulation);
            }
        }

        // 4. Build Context String with History
        $historyContext = $history->map(fn ($h): string => ucfirst((string) $h->role).': '.$h->content)->implode("\n");
        $fullContext = "--- HISTORY ---\n".$historyContext."\n\n--- CURRENT STATUS ---\n".$summary;

        if ($simulationContext !== '' && $simulationContext !== '0') {
            $fullContext .= "\n\n--- SIMULATION (AUTOPILOT DETECTED) ---\n".$simulationContext;
        }

        // 5. Call AI Service
        $aiResponse = $this->chatWithAiAction->execute($userMessage, $fullContext);

        // 6. Save History
        $this->saveHistory($user, 'user', $userMessage);
        $this->saveHistory($user, 'assistant', $aiResponse, ['simulation' => (bool) $simulationContext]);

        return $aiResponse;
    }

    private function getFinancialSummaryContext(): string
    {
        // Scoped to household automatically via HasHouseholdScope
        $transactions = Transaction::where('date', '>=', now()->subDays(30))
            ->orderBy('date', 'desc')
            ->get();

        $totalIncome = (float) $transactions->filter(fn ($t): bool => $t->type === TransactionType::INCOME)->sum('amount');
        $totalExpense = (float) $transactions->filter(fn ($t): bool => $t->type === TransactionType::EXPENSE)->sum('amount');
        $savings = $totalIncome - $totalExpense;

        // Scoped to household automatically via HasHouseholdScope
        $goals = Goal::get();

        // 4. Advanced Sovereign Metrics
        $sovereign = $this->intelService->getSovereignMetrics();

        $ctx = '--- DATA KEUANGAN (30 HARI) ---'."\n";
        $ctx .= 'Total Pemasukan: Rp '.number_format($totalIncome)."\n";
        $ctx .= 'Total Pengeluaran: Rp '.number_format($totalExpense)."\n";
        $ctx .= 'Net Cashflow: Rp '.number_format($savings)."\n";

        $ctx .= "\n".'--- METRIK SOVEREIGN (HISTORIS 6 BULAN) ---'."\n";
        $ctx .= 'Income Volatility: '.($sovereign['income_volatility'] * 100)."%\n";
        $ctx .= 'Expense Volatility: '.($sovereign['expense_volatility'] * 100)."%\n";
        $ctx .= 'Savings Rate: '.$sovereign['savings_rate']."%\n";
        $ctx .= 'Liquidity Ratio: '.$sovereign['liquidity_ratio']."x (Ketahanan Kas)\n";
        $ctx .= 'Framework Analisis: '.$sovereign['recommendation_framework']."\n";

        if ($goals->isNotEmpty()) {
            $ctx .= "\nGoals Strategis:\n";
            foreach ($goals->take(3) as $goal) {
                $ctx .= "- {$goal->name}: Progress Rp ".number_format($goal->current_amount).' / Rp '.number_format($goal->target_amount)."\n";
            }
        }

        return $ctx;
    }

    /**
     * @param  array{simulated_cash: float, impact_on_liquidity_days: int|float, days_remaining_simulated: int|float, is_risky: bool}  $sim
     */
    private function formatSimulationResult(array $sim): string
    {
        $text = "Jika melakukan pengeluaran ini:\n";
        $text .= '- Sisa dana tunai akan menjadi Rp '.number_format($sim['simulated_cash'])."\n";
        $text .= '- Ketahanan dana tunai berkurang '.$sim['impact_on_liquidity_days']." hari.\n";
        $text .= '- Sisa hari operasional: '.$sim['days_remaining_simulated']." hari.\n";
        if ($sim['is_risky']) {
            $text .= "[RISIKO TINGGI: Likuiditas akan kritis!]\n";
        }

        return $text;
    }

    private function parseAmount(string $str): float
    {
        $str = strtolower($str);

        $multiplier = 1;
        if (str_contains($str, 'juta') || str_contains($str, 'jt')) {
            $multiplier = 1000000;
        } elseif (str_contains($str, 'ratus ribu')) {
            $multiplier = 100000;
        } elseif (str_contains($str, 'ribu') || str_contains($str, 'rb')) {
            $multiplier = 1000;
        }

        // Clean numeric part (e.g. "1.500,50" or "1500")
        preg_match('/[\d.,]+/', $str, $matches);
        $numStr = $matches[0] ?? '0';

        // Smart cleaning for thousand separators vs decimals
        if (str_contains($numStr, '.') && str_contains($numStr, ',')) {
            if (strrpos($numStr, '.') > strrpos($numStr, ',')) {
                $numStr = str_replace(',', '', $numStr);
            } else {
                $numStr = str_replace('.', '', $numStr);
                $numStr = str_replace(',', '.', $numStr);
            }
        } elseif (substr_count($numStr, '.') > 1) {
            $numStr = str_replace('.', '', $numStr);
        } elseif (substr_count($numStr, ',') > 1) {
            $numStr = str_replace(',', '', $numStr);
        } elseif (str_contains($numStr, ',')) {
            $numStr = str_replace(',', '.', $numStr);
        }

        return (float) $numStr * $multiplier;
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private function saveHistory(User $user, string $role, string $content, array $metadata = []): void
    {
        ChatHistory::create([
            'user_id' => $user->id,
            'role' => $role,
            'content' => $content,
            'metadata' => $metadata,
        ]);
    }
}
