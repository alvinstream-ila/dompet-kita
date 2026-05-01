<?php

declare(strict_types=1);

namespace App\Actions\Finance;

use App\Actions\BaseAction;
use App\Exceptions\CfoAnalysisException;
use App\Models\Asset;
use App\Models\Transaction;
use App\Models\User;
use App\Services\AI\AiProviderManager;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class PerformCfoAnalysisAction extends BaseAction
{
    public function __construct(
        private readonly AiProviderManager $aiManager
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
    public function execute(User $user, string $month): array
    {
        $currentDate = Carbon::parse($month.'-01');
        $startDate = $currentDate->copy()->subMonths(5)->startOfMonth();
        $endDate = $currentDate->copy()->endOfMonth();

        $transactions = $this->getTransactions($user, $startDate, $endDate);
        if ($transactions->isEmpty()) {
            throw new CfoAnalysisException("No transaction data found for the period {$startDate->format('Y-m')} to {$month}.");
        }

        $monthlyData = $this->groupMonthlyData($transactions);
        $totalAssets = $this->calculateTotalAssets($user);

        $metrics = $this->computeCfoMetrics($monthlyData, $user, $totalAssets);
        $categories = $this->getCategoryBreakdown($transactions, $month);

        /** @var array{income: float, expense: float}|null $currentMonthData */
        $currentMonthData = $monthlyData->get($month);
        $advice = $this->generateCfoAdvice($month, $metrics, $currentMonthData, $categories);

        return [
            'month' => $month,
            'metrics' => $metrics,
            'summary' => (array) ($currentMonthData ?? ['income' => 0.0, 'expense' => 0.0]),
            'categories' => $categories,
            'advice' => $advice,
        ];
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, Transaction>
     */
    private function getTransactions(User $user, Carbon $start, Carbon $end): \Illuminate\Database\Eloquent\Collection
    {
        $query = Transaction::withoutGlobalScopes()->whereBetween('date', [$start, $end]);

        return $user->household_id
            ? $query->where('household_id', $user->household_id)->get()
            : $query->where('user_id', $user->id)->get();
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, Transaction>  $transactions
     * @return Collection<string, array{income: float, expense: float}>
     */
    private function groupMonthlyData(\Illuminate\Database\Eloquent\Collection $transactions): Collection
    {
        return $transactions->groupBy(fn (Transaction $t): string => Carbon::parse($t->date)->format('Y-m'))
            ->map(fn (\Illuminate\Database\Eloquent\Collection $group): array => [
                'income' => (float) $group->where('type', 'income')->sum('amount'),
                'expense' => (float) $group->where('type', 'expense')->sum('amount'),
            ]);
    }

    private function calculateTotalAssets(User $user): float
    {
        $query = Asset::withoutGlobalScopes();
        if ($user->household_id) {
            $query->where('household_id', $user->household_id);
        } else {
            $query->where('user_id', $user->id);
        }

        return (float) $query->sum('value');
    }

    /**
     * @param  Collection<string, array{income: float, expense: float}>  $monthlyData
     * @return array{
     *     permanent_income: float,
     *     volatility: float,
     *     runway: float,
     *     total_assets: float
     * }
     */
    private function computeCfoMetrics(Collection $monthlyData, User $user, float $totalAssets): array
    {
        $totalIncome = (float) $monthlyData->sum('income');
        $avgExpense = (float) $monthlyData->sum('expense') / 6;

        /** @var array<int, float> $incomes */
        $incomes = $monthlyData->pluck('income')->toArray();

        // Calculate liquid assets for runway
        $assetQuery = Asset::withoutGlobalScopes();
        if ($user->household_id) {
            $assetQuery->where('household_id', $user->household_id);
        } else {
            $assetQuery->where('user_id', $user->id);
        }
        $liquidAssets = (float) $assetQuery->whereIn('type', ['cash', 'bank', 'e-wallet'])->sum('value');

        $burnRate = $avgExpense > 0 ? $avgExpense : 1;

        return [
            'permanent_income' => $totalIncome / 6,
            'volatility' => $this->calculateCV($incomes),
            'runway' => $liquidAssets / $burnRate,
            'total_assets' => $totalAssets,
        ];
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, Transaction>  $transactions
     * @return array<string, float>
     */
    private function getCategoryBreakdown(\Illuminate\Database\Eloquent\Collection $transactions, string $month): array
    {
        return $transactions->filter(fn (Transaction $t): bool => Carbon::parse($t->date)->format('Y-m') === $month)
            ->groupBy('category')
            ->map(fn (\Illuminate\Database\Eloquent\Collection $g): float => (float) $g->sum('amount'))
            ->all();
    }

    /**
     * @param array{
     *     permanent_income: float,
     *     volatility: float,
     *     runway: float,
     *     total_assets: float
     * } $metrics
     * @param  array{income: float, expense: float}|null  $currentMonth
     * @param  array<string, float>  $categories
     */
    private function generateCfoAdvice(string $month, array $metrics, ?array $currentMonth, array $categories): string
    {
        $prompt = "Identitas: Anda adalah 'Sovereign CFO Partner', penasihat keuangan elit.
            Tugas: Berikan analisis strategis berdasarkan data finansial 6 bulan terakhir.

            METRIK UTAMA:
            - Target Analisis: {$month}
            - Permanent Income (6-mo avg): Rp ".number_format($metrics['permanent_income']).'
            - Income Volatility: '.round($metrics['volatility'] * 100, 2).'% (CV)
            - Current Month Income: Rp '.number_format($currentMonth['income'] ?? 0).'
            - Current Month Expense: Rp '.number_format($currentMonth['expense'] ?? 0).'
            - Financial Runway (Liquid): '.round($metrics['runway'], 1).' bulan
            - Total Wealth: Rp '.number_format($metrics['total_assets'])."
            - Detail Kategori ({$month}): ".json_encode($categories)."

            INSTRUKSI KHUSUS:
            1. Gunakan 'Permanent Income Hypothesis'. Jika income dinamis/naik-turun tapi rata-rata tetap tinggi, jangan panik. Fokus pada stabilitas jangka panjang.
            2. Analisis 'Margin of Safety'. Apakah pendapatan permanen jauh di atas rata-rata pengeluaran?
            3. Jika Runway > 6 bulan, berikan pujian atas ketahanan aset (Wealth Resilience).
            4. Nada bicara: Elit, Tenang, Data-Driven, dan Profesional. NO marking/lebay.
            5. Berikan 3 poin strategi yang benar-benar kritis dan tajam.";

        return $this->aiManager->generateText($prompt);
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
            $variance += ($value - $mean) ** 2;
        }
        $stdDev = sqrt($variance / $count);

        return $stdDev / $mean;
    }
}
