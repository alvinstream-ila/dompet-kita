<?php

declare(strict_types=1);

namespace App\Actions\Finance;

use App\Actions\BaseAction;
use App\Exceptions\CfoAnalysisException;
use App\Models\Asset;
use App\Models\Transaction;
use App\Services\GeminiService;
use Exception;
use Illuminate\Support\Carbon;

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
     *     metrics: array{
     *         permanent_income: float,
     *         volatility: float,
     *         runway: float,
     *         total_assets: float
     *     },
     *     summary: array{income: float, expense: float},
     *     categories: array<string, float>,
     *     advice: string
     * }
     *
     * @throws Exception
     */
    public function execute(string $month): array
    {
        $currentDate = Carbon::parse($month.'-01');
        $startDate = $currentDate->copy()->subMonths(5)->startOfMonth();
        $endDate = $currentDate->copy()->endOfMonth();

        // 1. Fetch Transactions for the last 6 months
        $transactions = Transaction::whereBetween('date', [$startDate, $endDate])->get();

        if ($transactions->isEmpty()) {
            throw new CfoAnalysisException("No transaction data found for the period {$startDate->format('Y-m')} to {$month}.");
        }

        // 2. Calculate Monthly Metrics
        $monthlyData = $transactions->groupBy(fn ($t) => Carbon::parse($t->date)->format('Y-m'))
            ->map(function ($group) {
                return [
                    'income' => (float) $group->where('type', 'income')->sum('amount'),
                    'expense' => (float) $group->where('type', 'expense')->sum('amount'),
                ];
            });

        $totalIncome = (float) $monthlyData->sum('income');
        $permanentIncome = $totalIncome / 6;
        $avgExpense = (float) $monthlyData->sum('expense') / 6;

        // Calculate Income Volatility (Coefficient of Variation)
        /** @var array<int, float> $incomes */
        $incomes = $monthlyData->pluck('income')->toArray();
        $volatility = $this->calculateCV($incomes);

        // 3. Fetch Asset Data for Liquidity/Runway
        $liquidAssets = (float) Asset::whereIn('type', ['cash', 'bank', 'e-wallet'])->sum('value');
        $totalAssets = (float) Asset::sum('value');

        $burnRate = $avgExpense > 0 ? $avgExpense : 1;
        $runway = $liquidAssets / $burnRate;

        // 4. Current Month specific data
        $currentMonthData = $transactions->filter(fn ($t) => Carbon::parse($t->date)->format('Y-m') === $month);
        /** @var array<string, float> $categories */
        $categories = $currentMonthData->groupBy('category')->map(fn ($g) => (float) $g->sum('amount'))->all();

        // 5. Build Sophisticated Prompt
        $prompt = "Identitas: Anda adalah 'Sovereign CFO Partner', penasihat keuangan elit untuk Alvin & Ila.
            Tugas: Berikan analisis strategis berdasarkan data finansial 6 bulan terakhir.

            METRIK UTAMA:
            - Target Analisis: {$month}
            - Permanent Income (6-mo avg): Rp ".number_format($permanentIncome).'
            - Income Volatility: '.round($volatility * 100, 2).'% (CV)
            - Current Month Income: Rp '.number_format($monthlyData[$month]['income'] ?? 0).'
            - Current Month Expense: Rp '.number_format($monthlyData[$month]['expense'] ?? 0).'
            - Financial Runway (Liquid): '.round($runway, 1).' bulan
            - Total Wealth: Rp '.number_format($totalAssets)."
            - Detail Kategori ({$month}): ".json_encode($categories)."

            INSTRUKSI KHUSUS:
            1. Gunakan 'Permanent Income Hypothesis'. Jika income dinamis/naik-turun tapi rata-rata tetap tinggi, jangan panik. Fokus pada stabilitas jangka panjang.
            2. Analisis 'Margin of Safety'. Apakah pendapatan permanen jauh di atas rata-rata pengeluaran?
            3. Jika Runway > 6 bulan, berikan pujian atas ketahanan aset (Wealth Resilience).
            4. Nada bicara: Elit, Tenang, Data-Driven, dan Profesional. NO marking/lebay.
            5. Berikan 3 poin strategi yang benar-benar kritis dan tajam.";

        $advice = (string) $this->gemini->analyzeFinancials($prompt);

        return [
            'month' => $month,
            'metrics' => [
                'permanent_income' => $permanentIncome,
                'volatility' => $volatility,
                'runway' => $runway,
                'total_assets' => $totalAssets,
            ],
            'summary' => (array) ($monthlyData[$month] ?? ['income' => 0.0, 'expense' => 0.0]),
            'categories' => $categories,
            'advice' => $advice,
        ];
    }

    /**
     * Calculate Coefficient of Variation (Standard Deviation / Mean)
     *
     * @param  array<int, float>  $data
     */
    private function calculateCV(array $data): float
    {
        $count = count($data);
        if ($count === 0) {
            return 0;
        }

        $mean = array_sum($data) / $count;
        if ($mean <= 0) {
            return 0;
        }

        $variance = 0;
        foreach ($data as $value) {
            $variance += pow($value - $mean, 2);
        }
        $stdDev = sqrt($variance / $count);

        return $stdDev / $mean;
    }
}
