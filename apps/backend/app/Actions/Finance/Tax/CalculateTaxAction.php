<?php

namespace App\Actions\Finance\Tax;

use App\Actions\BaseAction;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

class CalculateTaxAction extends BaseAction
{
    /**
     * Indonesian Personal Income Tax Brackets 2024-2026 (Progresif)
     * 0 - 60jt: 5%
     * 60jt - 250jt: 15%
     * 250jt - 500jt: 25%
     * 500jt - 5m: 30%
     * > 5m: 35%
     */
    private array $brackets = [
        ['limit' => 60000000, 'rate' => 0.05],
        ['limit' => 250000000, 'rate' => 0.15],
        ['limit' => 500000000, 'rate' => 0.25],
        ['limit' => 5000000000, 'rate' => 0.30],
        ['limit' => PHP_FLOAT_MAX, 'rate' => 0.35],
    ];

    /**
     * PTKP (Penghasilan Tidak Kena Pajak) - Single person basic: 54,000,000 IDR
     * Note: For Alvin & Ila (Married status might change this).
     */
    private float $ptkpBase = 54000000;

    private float $ptkpExtraMarried = 4500000;

    /**
     * Calculate taxable income and estimated tax for a given year.
     */
    public function execute(User $user, int $year): array
    {
        $startOfYear = Carbon::create($year, 1, 1)->startOfDay();
        $endOfYear = Carbon::create($year, 12, 31)->endOfDay();

        // Sum income (Income type transactions)
        $totalIncome = Transaction::where('user_id', $user->id)
            ->where('type', TransactionType::INCOME)
            ->whereBetween('date', [$startOfYear, $endOfYear])
            ->sum('amount');

        // Apply PTKP
        $ptkp = $this->ptkpBase;
        if ($user->partner_id) { // changed from partner_name to partner_id based on later logic
            $ptkp += $this->ptkpExtraMarried;
        }

        $taxableIncome = max(0, $totalIncome - $ptkp);
        $taxPayable = $this->calculateProgressiveTax($taxableIncome);

        $effectiveRate = $totalIncome > 0 ? ($taxPayable / $totalIncome) * 100 : 0;

        return [
            'year' => $year,
            'total_income' => $totalIncome,
            'ptkp' => $ptkp,
            'taxable_income' => $taxableIncome,
            'estimated_tax' => $taxPayable,
            'effective_rate' => round($effectiveRate, 2),
            // Extra metadata for AI advice
            'ptkp_status' => $user->partner_id ? 'Status K/1 (Menikah/Ada Tanggungan)' : 'Status TK/0 (Lajang/Tidak Ada Tanggungan)',
            'ptkp_value' => $ptkp,
        ];
    }

    /**
     * Progressive tax calculation logic.
     */
    private function calculateProgressiveTax(float $taxableIncome): float
    {
        $totalTax = 0;
        $remainingIncome = $taxableIncome;
        $previousLimit = 0;

        foreach ($this->brackets as $bracket) {
            $rangeAmount = $bracket['limit'] - $previousLimit;
            $amountInBracket = min($remainingIncome, $rangeAmount);

            if ($amountInBracket <= 0) {
                break;
            }

            $totalTax += $amountInBracket * $bracket['rate'];
            $remainingIncome -= $amountInBracket;
            $previousLimit = $bracket['limit'];

            if ($remainingIncome <= 0) {
                break;
            }
        }

        return $totalTax;
    }
}
