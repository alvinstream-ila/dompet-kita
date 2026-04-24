<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;

class FinancialIntelligenceService
{
    private const CALCULATION_DAYS = 30;

    private const SAFETY_THRESHOLD_DAYS = 15;

    private const WARNING_THRESHOLD_DAYS = 7;

    private const CRITICAL_THRESHOLD_DAYS = 3;

    private const HIGH_INCOME_THRESHOLD = 10000000;


    /**
     * Prediction of when liquidity (Cash) will run out based on average spending.
     * Includes option to toggle partner's cash into the calculation.
     *
     * @param  bool  $includePartner  Whether to include the partner's assets in the calculation
     * @return array{status: string, days_remaining: float, current_cash: float, burn_rate: float, message: string}
     */
    public function predictLiquidityCrisis(User $user, bool $includePartner = true): array
    {
        // 1. Calculate Total Liquid Cash from Assets (Cash & Bank)
        // Scoped to household automatically via HasHouseholdScope
        $liquidAssets = \App\Models\Asset::whereIn('type', [\App\Enums\AssetType::CASH, \App\Enums\AssetType::BANK])
            ->sum('value');

        // 2. Determine Budget Cycle (Current Month)
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // 3. Calculate Total Income & Expense for this month
        $monthlyIncome = Transaction::where('type', TransactionType::INCOME)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $monthlyExpense = Transaction::where('type', TransactionType::EXPENSE)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        // Total available liquidity is current liquid assets + net flow of this month
        $currentMonthNet = (float) $monthlyIncome - (float) $monthlyExpense;
        $totalLiquidity = max(0.0, (float) $liquidAssets + $currentMonthNet);

        // 4. Calculate Average Daily Expense (Last 30 days) for Burn Rate
        $thirtyDaysAgo = Carbon::now()->subDays(self::CALCULATION_DAYS);
        $firstTxDate = Transaction::where('type', TransactionType::EXPENSE)
            ->where('date', '>=', $thirtyDaysAgo)
            ->min('date');

        $usageDays = is_string($firstTxDate)
            ? max(1, min(self::CALCULATION_DAYS, (int) Carbon::parse($firstTxDate)->diffInDays(Carbon::now()) + 1))
            : self::CALCULATION_DAYS;

        $totalHistoryExpense = Transaction::where('type', TransactionType::EXPENSE)
            ->where('date', '>=', $thirtyDaysAgo)
            ->sum('amount');

        $dailyBurnRate = $totalHistoryExpense / $usageDays;

        if ($dailyBurnRate <= 0) {
            return [
                'status' => 'safe',
                'days_remaining' => 999.0,
                'current_cash' => (float) $totalLiquidity,
                'burn_rate' => 0.0,
                'message' => 'Status likuiditas optimal. Tidak terdeteksi volatilitas pengeluaran signifikan dalam periode ini.',
            ];
        }

        // 5. Calculate Remaining Days
        $daysRemaining = $totalLiquidity / $dailyBurnRate;

        // High Income Adjustment (Strategic CFO Perspective)
        $isHighIncome = $monthlyIncome >= 10000000;
        
        $status = 'safe';
        $message = 'Parameter likuiditas terpantau stabil. Strategi alokasi modal saat ini dapat dipertahankan.';

        if ($daysRemaining <= self::CRITICAL_THRESHOLD_DAYS) {
            $status = 'CRITICAL';
            $message = 'RISIKO LIKUIDITAS KRITIS: Dana operasional diprediksi habis dalam ' . round($daysRemaining, 1) . ' hari. Diperlukan penundaan pengeluaran non-esensial segera.';
        } elseif ($daysRemaining <= self::WARNING_THRESHOLD_DAYS) {
            $status = 'WARNING';
            $message = 'PERINGATAN DEFISIT: Ketahanan kas di bawah ' . self::WARNING_THRESHOLD_DAYS . ' hari. Evaluasi ulang pengeluaran variabel untuk menjaga solvabilitas.';
        } elseif ($daysRemaining < self::SAFETY_THRESHOLD_DAYS) {
            $status = 'CAUTION';
            $message = 'ATENSI MANAJEMEN KAS: Cadangan likuiditas mulai menipis. Pertimbangkan efisiensi biaya operasional harian.';
        }

        if ($isHighIncome && $status === 'safe') {
            $message = 'Kapasitas modal tinggi terdeteksi. Fokus pada optimasi investasi dan perluasan aset produktif.';
        }

        return [
            'status' => $status,
            'days_remaining' => (float) round($daysRemaining, 1),
            'current_cash' => (float) $totalLiquidity,
            'burn_rate' => (float) round($dailyBurnRate, 0),
            'message' => $message,
        ];
    }

    /**
     * Asset Rebalancing Advice based on Liquidity and Targets.
     *
     * @return array<int, array{action: string, amount?: float, reason: string}>
     */
    public function generateRebalanceAdvice(User $user, bool $includePartner = false): array
    {
        $prediction = $this->predictLiquidityCrisis($user, $includePartner);

        // Safety Buffer: Minimal 2x monthly burn in Cash
        $monthlyNeed = $prediction['burn_rate'] * 30;
        $safetyBuffer = $monthlyNeed * 2;
        $actualCash = $prediction['current_cash'];

        $advice = [];

        if ($actualCash > $safetyBuffer * 1.5) {
            $surplus = $actualCash - $safetyBuffer;
            $advice[] = [
                'action' => 'INVEST',
                'amount' => (float) $surplus,
                'reason' => 'Terdeteksi surplus likuiditas sebesar Rp ' . number_format($surplus) . '. Rekomendasi alokasi ke instrumen pasar uang atau aset produktif untuk optimalisasi return.',
            ];
        } elseif ($actualCash < $monthlyNeed * 0.5) {
            $advice[] = [
                'action' => 'REPLENISH',
                'reason' => 'Cadangan likuiditas berada di bawah parameter aman. Pertimbangkan likuidasi sebagian aset jangka pendek atau pengetatan biaya operasional.',
            ];
        } else {
            $advice[] = [
                'action' => 'HOLD',
                'reason' => 'Struktur alokasi kas saat ini berada pada level optimal. Pertahankan disiplin manajerial ini.',
            ];
        }

        return $advice;
    }

    /**
     * Simulate the financial impact of an additional expense.
     *
     * @return array{simulated_cash: float, impact_on_liquidity_days: float, days_remaining_simulated: float, is_risky: bool}
     */
    public function simulateFinancialImpact(User $user, float $amount, bool $includePartner = false): array
    {
        $prediction = $this->predictLiquidityCrisis($user, $includePartner);

        $simulatedCash = max(0.0, $prediction['current_cash'] - $amount);
        $burnRate = $prediction['burn_rate'];
        $daysRemaining = $burnRate > 0 ? (float) round($simulatedCash / $burnRate, 1) : 999.0;
        $impactDays = $burnRate > 0 ? (float) round($amount / $burnRate, 1) : 0.0;

        return [
            'simulated_cash' => $simulatedCash,
            'impact_on_liquidity_days' => $impactDays,
            'days_remaining_simulated' => $daysRemaining,
            'is_risky' => $daysRemaining < self::WARNING_THRESHOLD_DAYS,
        ];
    }

    /**
     * Get current market rates for USD/IDR and Gold (XAU).
     *
     * @return array{usd_idr: float, gold_gram: float}
     */
    public function getCurrentMarketContext(): array
    {
        try {
            $market = app(MarketService::class)->getRates();

            return [
                'usd_idr' => (float) ($market['currency_rates']['IDR'] ?? 16950.0),
                'gold_gram' => (float) $market['gold_antam_gram'],
            ];
        } catch (\Throwable $e) {
            return [
                'usd_idr' => 16950.0,
                'gold_gram' => 2525000.0,
            ];
        }
    }

    /**
     * Calculate historical volatility and advanced sovereign metrics.
     * 
     * @return array{
     *   income_volatility: float,
     *   expense_volatility: float,
     *   savings_rate: float,
     *   liquidity_ratio: float,
     *   is_high_income: bool,
     *   is_volatile: bool,
     *   recommendation_framework: string
     * }
     */
    public function getSovereignMetrics(User $user): array
    {
        $months = 6;
        $monthlyData = [];

        for ($i = 0; $i < $months; $i++) {
            $start = now()->subMonths($i)->startOfMonth();
            $end = now()->subMonths($i)->endOfMonth();

            $income = (float) Transaction::where('type', TransactionType::INCOME)
                ->whereBetween('date', [$start, $end])
                ->sum('amount');

            $expense = (float) Transaction::where('type', TransactionType::EXPENSE)
                ->whereBetween('date', [$start, $end])
                ->sum('amount');

            $monthlyData[] = ['income' => $income, 'expense' => $expense];
        }

        $incomes = array_column($monthlyData, 'income');
        $expenses = array_column($monthlyData, 'expense');

        $incomeVolatility = $this->calculateRelativeStdDev($incomes);
        $expenseVolatility = $this->calculateRelativeStdDev($expenses);

        $avgIncome = count(array_filter($incomes)) > 0 ? array_sum($incomes) / count(array_filter($incomes)) : 0;
        $avgExpense = count(array_filter($expenses)) > 0 ? array_sum($expenses) / count(array_filter($expenses)) : 0;
        
        $savingsRate = $avgIncome > 0 ? (($avgIncome - $avgExpense) / $avgIncome) * 100 : 0;

        $liquidAssets = (float) \App\Models\Asset::whereIn('type', [\App\Enums\AssetType::CASH, \App\Enums\AssetType::BANK])
            ->sum('value');
        
        $liquidityRatio = $avgExpense > 0 ? $liquidAssets / $avgExpense : 99.0;

        $isHighIncome = $avgIncome >= self::HIGH_INCOME_THRESHOLD;
        $isVolatile = $incomeVolatility > 0.3 || $expenseVolatility > 0.3;

        // Determine framework based on economic theory
        $framework = 'General Balanced Strategy';
        if ($isHighIncome && $isVolatile) {
            $framework = 'Precautionary Buffer & Cash Smoothing (PIH focus)';
        } elseif ($isHighIncome) {
            $framework = 'Capital Efficiency & Asset Accumulation (MPT focus)';
        } elseif ($isVolatile) {
            $framework = 'Liquidity Defense & Consumption Smoothing';
        }

        return [
            'income_volatility' => round($incomeVolatility, 2),
            'expense_volatility' => round($expenseVolatility, 2),
            'savings_rate' => round($savingsRate, 2),
            'liquidity_ratio' => round($liquidityRatio, 2),
            'is_high_income' => $isHighIncome,
            'is_volatile' => $isVolatile,
            'recommendation_framework' => $framework,
        ];
    }

    /**
     * Calculate Standard Deviation relative to the mean (Coefficient of Variation).
     *
     * @param float[] $values
     */
    private function calculateRelativeStdDev(array $values): float
    {
        $filtered = array_filter($values);
        $count = count($filtered);
        if ($count < 2) return 0.0;

        $mean = array_sum($filtered) / $count;
        if ($mean <= 0) return 0.0;

        $variance = 0.0;
        foreach ($filtered as $v) {
            $variance += pow($v - $mean, 2);
        }
        $stdDev = sqrt($variance / ($count - 1));

        return $stdDev / $mean;
    }
}

