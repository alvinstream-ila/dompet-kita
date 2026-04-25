<?php

namespace App\Services\Cfo;

use App\Models\Transaction;
use App\Models\TransactionInsight;
use App\Models\User;
use App\Services\AI\AiProviderManager;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class QuantumInsightEngine
{
    protected AiProviderManager $aiManager;

    public function __construct(AiProviderManager $aiManager)
    {
        $this->aiManager = $aiManager;
    }

    /**
     * Generate fresh insights for a specific user.
     */
    public function generateInsights(User $user): void
    {
        Log::info("Quantum Insight Engine: Started analysis for User {$user->id}");

        // 1. Core Data Gathering (Last 30 Days)
        $endDate = Carbon::now();
        $startDate = Carbon::now()->subDays(30);

        $query = Transaction::whereBetween('date', [$startDate, $endDate]);

        if ($user->household_id) {
            $query->where('household_id', $user->household_id);
        } else {
            $query->where('user_id', $user->id);
        }

        $transactions = $query->orderBy('date', 'desc')->get();

        if ($transactions->isEmpty()) {
            Log::info("Quantum Insight Engine: No transactions found for User {$user->id}. Skipping.");

            return;
        }

        // 2. Prepare Data for AI Analysis
        $summary = [
            'total_expense' => $transactions->where('type', 'expense')->sum('amount'),
            'total_income' => $transactions->where('type', 'income')->sum('amount'),
            'category_breakdown' => $transactions->where('type', 'expense')
                ->groupBy('category')
                ->map(fn ($group) => $group->sum('amount')),
            'transaction_count' => $transactions->count(),
            'recent_history' => $transactions->take(15)->map(fn ($t) => [
                'date' => $t->date,
                'desc' => $t->description,
                'amount' => $t->amount,
                'cat' => $t->category,
            ]),
        ];

        // 3. AI Cognitive Reasoning Prompt
        $prompt = $this->buildAnalysisPrompt($user->name, $summary);

        try {
            $aiResponse = $this->aiManager->generateText($prompt);
            Log::debug('Quantum Insight Engine: Raw AI Response: '.$aiResponse);

            $cleanJson = $this->cleanJsonResponse($aiResponse);
            /** @var array{findings?: array<int, array<string, mixed>>}|null $insights */
            $insights = json_decode($cleanJson, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::warning('Quantum Insight Engine: JSON Decode Failed. Attempting heuristic extraction.');

                // Heuristic: If it looks like a single insight not in JSON, wrap it
                if (strlen($cleanJson) > 50 && ! str_contains($cleanJson, '{')) {
                    $insights = [
                        'findings' => [
                            [
                                'type' => 'trend',
                                'title' => 'Analisis AI',
                                'content' => $cleanJson,
                                'impact_value' => 0,
                                'action_url' => '/transactions',
                            ],
                        ],
                    ];
                } else {
                    return;
                }
            }

            if (isset($insights['findings'])) {
                Log::info('Quantum Insight Engine: Found '.count($insights['findings']).' findings.');
                foreach ($insights['findings'] as $finding) {
                    $this->persistInsight($user, $finding);
                }
            } else {
                Log::info('Quantum Insight Engine: No findings key in AI response.');
            }
        } catch (\Exception $e) {
            Log::error('Quantum Insight Engine Failed: '.$e->getMessage());
        }
    }

    /**
     * @param  array<string, mixed>  $summary
     */
    protected function buildAnalysisPrompt(string $userName, array $summary): string
    {
        $jsonSummary = json_encode($summary);

        return "Anda adalah Sovereign CFO Strategic Intelligence untuk {$userName}. ".
               'Gunakan prinsip ekonomi makro dan manajemen kekayaan institusional untuk menganalisis data berikut: '.$jsonSummary.
               "\n\nInstruksi Analisis Strategis:".
               "\n1. Liquidity Layering: Evaluasi cadangan kas berdasarkan model 3-layer (Short-term buffer, Medium-term tax/obligations, Long-term wealth).".
               "\n2. Decoupling Analysis: Jika terdapat volatilitas cashflow tinggi dengan income besar (seperti >10jt), jangan memberikan penilaian 'buruk' secara dangkal. Analisis apakah volatility ini bersifat sistemik atau strategis. Sarankan model 'Fixed Salary' dari 'Variable Surplus' untuk menstabilkan gaya hidup.".
               "\n3. Stress-Testing: Lakukan simulasi terhadap skenario 'Worst Case' (penurunan income 30-50%) dan apakah struktur biaya saat ini masih resilien.".
               "\n4. Capital Efficiency: Identifikasi 'Idle Cash' yang bisa dioptimalkan menjadi aset produktif dengan mempertimbangkan Opportunity Cost.".
               "\n5. Tax & Leverage: Berikan saran mengenai efisiensi pajak dan penggunaan leverage (hutang) yang strategis.".
               "\n\nOUTPUT FORMAT: Strict JSON only.".
               "\n{".
               "\n  \"findings\": [".
               "\n    {".
               "\n      \"type\": \"leak|optimization|trend|achievement\",".
               "\n      \"title\": \"Judul strategis dan profesional\",".
               "\n      \"content\": \"Penjelasan mendalam dalam Bahasa Indonesia formal. Hubungkan dengan prinsip ekonomi.\",".
               "\n      \"impact_value\": 0,".
               "\n      \"action_url\": \"/transactions\"".
               "\n    }".
               "\n  ]".
               "\n}".
               "\n\nNote: Gunakan nada bicara elit, tenang, dan data-driven. DILARANG menggunakan kata 'Sayang' atau emoji.";
    }

    /**
     * @param  array<string, mixed>  $finding
     */
    protected function persistInsight(User $user, array $finding): void
    {
        // Avoid duplicate active insights with same title in last 7 days
        $exists = TransactionInsight::where('title', $finding['title'])
            ->where('created_at', '>=', now()->subDays(7))
            ->exists();

        if (! $exists) {
            TransactionInsight::create([
                'user_id' => $user->id,
                'household_id' => $user->household_id,
                'type' => $finding['type'] ?? 'trend',
                'title' => $finding['title'],
                'content' => $finding['content'],
                'impact_value' => $finding['impact_value'] ?? 0,
                'status' => 'new',
                'action_url' => $finding['action_url'] ?? null,
                'metadata' => $finding,
            ]);
        }
    }

    protected function cleanJsonResponse(string $response): string
    {
        // Try to extract content between ```json and ```
        if (preg_match('/```json\s*(.*?)\s*```/s', $response, $matches)) {
            return trim($matches[1]);
        }

        // Try to extract content between { and }
        if (preg_match('/({.*})/s', $response, $matches)) {
            return trim($matches[1]);
        }

        return trim($response);
    }
}
