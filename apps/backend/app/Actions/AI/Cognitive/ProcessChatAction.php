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
    protected ChatWithAiAction $chatWithAiAction;

    protected FinancialIntelligenceService $intelService;

    public function __construct(ChatWithAiAction $chatWithAiAction, FinancialIntelligenceService $intelService)
    {
        $this->chatWithAiAction = $chatWithAiAction;
        $this->intelService = $intelService;
    }

    /**
     * Process a chat message with persistent history and cognitive simulation.
     */
    public function execute(User $user, string $userMessage): string
    {
        // 1. Get Conversation History (Last 10 turns for context)
        $history = ChatHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse();

        // 2. Prepare Context (Current Financial Status)
        $summary = $this->getFinancialSummaryContext($user);

        // 3. Detect Simulation Intent (Simple Regex for Amount)
        $simulationContext = '';
        if (preg_match('/(\d+[\d.,]*)\s?(ribu|juta|jt|rb|ratus ribu)/i', $userMessage, $matches)) {
            $amount = $this->parseAmount($matches[0]);
            if ($amount > 0) {
                // Dependency on FinancialIntelligenceService (maybe later this becomes an action too, but for now we inject it)
                $simulation = $this->intelService->simulateFinancialImpact($user, $amount);
                $simulationContext = $this->formatSimulationResult($simulation);
            }
        }

        // 4. Build Context String with History
        $historyContext = $history->map(fn ($h) => ucfirst($h->role).': '.$h->content)->implode("\n");
        $fullContext = "--- HISTORY ---\n".$historyContext."\n\n--- CURRENT STATUS ---\n".$summary;

        if ($simulationContext) {
            $fullContext .= "\n\n--- SIMULATION (AUTOPILOT DETECTED) ---\n".$simulationContext;
        }

        // 5. Call AI Service
        $aiResponse = $this->chatWithAiAction->execute($userMessage, $fullContext);

        // 6. Save History
        $this->saveHistory($user, 'user', $userMessage);
        $this->saveHistory($user, 'assistant', $aiResponse, ['simulation' => $simulationContext ? true : false]);

        return $aiResponse;
    }

    private function getFinancialSummaryContext(User $user): string
    {
        $transactions = Transaction::where('user_id', $user->id)
            ->where('date', '>=', now()->subDays(30))
            ->orderBy('date', 'desc')
            ->get();

        $totalIncome = (float) $transactions->where('type', TransactionType::INCOME)->sum('amount');
        $totalExpense = (float) $transactions->where('type', TransactionType::EXPENSE)->sum('amount');
        $savings = $totalIncome - $totalExpense;

        $goals = Goal::where('user_id', $user->id)->get();

        $ctx = 'Pemasukan: Rp '.number_format($totalIncome)."\n";
        $ctx .= 'Pengeluaran: Rp '.number_format($totalExpense)."\n";
        $ctx .= 'Sisa Saldo (30 hari): Rp '.number_format($savings)."\n";

        if ($goals->isNotEmpty()) {
            $ctx .= "Goals Terakhir:\n";
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
            'role' => (string) $role,
            'content' => (string) $content,
            'metadata' => $metadata,
        ]);
    }
}
