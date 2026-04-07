<?php

declare(strict_types=1);

namespace App\Actions\Finance;

use App\Actions\BaseAction;
use App\Models\Transaction;
use App\Services\GeminiService;
use Exception;

class PerformCfoAnalysisAction extends BaseAction
{
    public function __construct(
        private readonly GeminiService $gemini
    ) {}

    /**
     * Perform CFO level analysis for a specific month.
     *
     * @return array{
     *     month: string,
     *     summary: array<string, float>,
     *     categories: array<string, float>,
     *     advice: string
     * }
     *
     * @throws Exception
     */
    public function execute(string $month): array
    {
        $transactions = Transaction::where('date', 'like', "{$month}%")->get();

        if ($transactions->isEmpty()) {
            throw new Exception("No transaction data found for {$month}.");
        }

        $summary = $transactions->groupBy('type')->map(fn ($group) => (float) $group->sum('amount'))->toArray();
        $categories = $transactions->groupBy('category')->map(fn ($group) => (float) $group->sum('amount'))->toArray();

        $prompt = "Sebagai asisten keuangan premium keluarga 'Dompet Kita' (Alvin & Ila), ";
        $prompt .= "analisislah ringkasan transaksi bulan {$month} berikut:\n\n";
        $prompt .= 'Total Income: '.($summary['income'] ?? 0)."\n";
        $prompt .= 'Total Expense: '.($summary['expense'] ?? 0)."\n";
        $prompt .= 'Detail Kategori: '.json_encode($categories)."\n\n";
        $prompt .= 'Berikan 3 poin strategi finansial yang kritis, nada bicara elegan dan cerdas.';

        $advice = $this->gemini->analyzeFinancials($prompt);

        return [
            'month' => $month,
            'summary' => $summary,
            'categories' => $categories,
            'advice' => $advice,
        ];
    }
}
