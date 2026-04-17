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

    /**
     * Prediction of when liquidity (Cash) will run out based on average spending.
     * Includes option to toggle partner's cash into the calculation.
     *
     * @param  bool  $includePartner  Whether to include the partner's assets in the calculation
     * @return array{status: string, days_remaining: float, current_cash: float, burn_rate: float, message: string}
     */
    public function predictLiquidityCrisis(User $user, bool $includePartner = false): array
    {
        // 1. Determine User IDs for calculation
        $userIds = [$user->id];
        $partner = $user->partner;
        if ($includePartner && $partner instanceof User) {
            $userIds[] = $partner->id;
        }

        // 2. Determine Budget Cycle (Current Month)
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // 3. Calculate Total Income & Expense for this month
        $monthlyIncome = Transaction::whereIn('user_id', $userIds)
            ->where('type', TransactionType::INCOME)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $monthlyExpense = Transaction::whereIn('user_id', $userIds)
            ->where('type', TransactionType::EXPENSE)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        // Current Cash is the net flow for this month
        $totalCash = max(0.0, (float) $monthlyIncome - (float) $monthlyExpense);

        // 4. Calculate Average Daily Expense (Last 30 days) for Burn Rate
        $thirtyDaysAgo = Carbon::now()->subDays(self::CALCULATION_DAYS);

        // Calculate days since first transaction in the 30-day window to avoid 30-day dilution for new users
        $firstTxDate = Transaction::whereIn('user_id', $userIds)
            ->where('type', TransactionType::EXPENSE)
            ->where('date', '>=', $thirtyDaysAgo)
            ->min('date');

        $usageDays = is_string($firstTxDate)
            ? max(1, min(self::CALCULATION_DAYS, (int) Carbon::parse($firstTxDate)->diffInDays(Carbon::now()) + 1))
            : self::CALCULATION_DAYS;

        $totalHistoryExpense = Transaction::whereIn('user_id', $userIds)
            ->where('type', TransactionType::EXPENSE)
            ->where('date', '>=', $thirtyDaysAgo)
            ->sum('amount');

        $dailyBurnRate = $totalHistoryExpense / $usageDays;

        if ($dailyBurnRate <= 0) {
            return [
                'status' => 'safe',
                'days_remaining' => 999.0,
                'current_cash' => (float) $totalCash,
                'burn_rate' => 0.0,
                'message' => 'Sayang, aku tidak mendeteksi pengeluaran berarti belakangan ini. Saldo kamu aman terkendali! 🌸',
            ];
        }

        // 5. Calculate Remaining Days
        $daysRemaining = $totalCash / $dailyBurnRate;

        $status = 'safe';
        $message = 'Likuiditas kamu terpantau aman ya Sayang. Terus pertahankan pola hematnya! ✨';

        if ($daysRemaining <= self::CRITICAL_THRESHOLD_DAYS) {
            $status = 'CRITICAL';
            $message = 'WASPADA SAYANG! 🚨 Dana tunai bulan ini diprediksi habis dalam kurang dari '.self::CRITICAL_THRESHOLD_DAYS.' hari. Segera rem pengeluaran ya!';
        } elseif ($daysRemaining <= self::WARNING_THRESHOLD_DAYS) {
            $status = 'WARNING';
            $message = 'Hati-hati ya, sisa uang bulan ini hanya cukup untuk sekitar '.self::WARNING_THRESHOLD_DAYS.' hari ke depan. Ayo lebih bijak belanja! ⚠️';
        } elseif ($daysRemaining < self::SAFETY_THRESHOLD_DAYS) {
            $status = 'CAUTION';
            $message = 'Perhatian Sayang, sisa budget sudah di bawah batas aman kenyamanan ('.self::SAFETY_THRESHOLD_DAYS.' hari). Mulai prihatin dulu ya? 📉';
        }

        return [
            'status' => $status,
            'days_remaining' => (float) round($daysRemaining, 1),
            'current_cash' => (float) $totalCash,
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
                'reason' => 'Ada surplus likuiditas nih Sayang! Dana menganggur sebesar Rp '.number_format($surplus).' sebaiknya dipindahkan ke SBN atau Emas biar makin cuan. 💰',
            ];
        } elseif ($actualCash < $monthlyNeed * 0.5) {
            $advice[] = [
                'action' => 'REPLENISH',
                'reason' => 'Dana tunai kita terlalu rendah nih. Pertimbangkan untuk mencairkan sebagian investasi atau kurangi jajan dulu ya Sayang. 🥺',
            ];
        } else {
            $advice[] = [
                'action' => 'HOLD',
                'reason' => 'Alokasi kas kamu saat ini sudah optimal banget. Pertahankan ya Sayang! ❤️',
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
}
