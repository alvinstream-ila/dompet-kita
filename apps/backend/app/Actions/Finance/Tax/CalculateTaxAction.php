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
     *
     * @var array<int, array{limit: float, rate: float}>
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
     */
    private float $ptkpBase = 54000000;

    private float $ptkpExtra = 4500000; // Extra for Married and for each dependent

    /**
     * Calculate taxable income and estimated tax for a given year.
     */
    public function execute(User $user, int $year): array
    {
        $startOfYear = Carbon::create($year, 1, 1)?->startOfDay() ?? throw new \InvalidArgumentException("Invalid year: {$year}");
        $endOfYear = Carbon::create($year, 12, 31)?->endOfDay() ?? throw new \InvalidArgumentException("Invalid year: {$year}");

        // Sum income (Income type transactions)
        $totalIncome = (float) Transaction::where('user_id', $user->id)
            ->where('type', TransactionType::INCOME)
            ->whereBetween('date', [$startOfYear, $endOfYear])
            ->sum('amount');

        // Apply PTKP Logic (Upped for 2026 Sovereign Standards)
        $ptkp = $this->ptkpBase;
        $isMarried = str_starts_with($user->tax_status ?? 'TK', 'K');

        if ($isMarried) {
            $ptkp += $this->ptkpExtra;
        }

        // Dependents (Max 3)
        $dependents = min(3, $user->dependents_count ?? 0);
        $ptkp += ($dependents * $this->ptkpExtra);

        $taxableIncome = max(0, $totalIncome - $ptkp);
        $taxPayable = $this->calculateProgressiveTax($taxableIncome);

        // 2026 DTP (Pajak Ditanggung Pemerintah) Logic - PMK 105/2025
        $isDtpEligible = $this->checkDtpEligibility($user, $totalIncome);
        $appliedIncentive = 0;

        if ($isDtpEligible) {
            $appliedIncentive = $taxPayable; // DTP covers 100% for eligible sectors in 2026
            $taxPayable = 0;
        }

        $effectiveRate = $totalIncome > 0 ? ($taxPayable + $appliedIncentive) / $totalIncome * 100 : 0;

        return [
            'year' => $year,
            'total_income' => $totalIncome,
            'ptkp' => $ptkp,
            'taxable_income' => $taxableIncome,
            'estimated_tax' => $taxPayable,
            'applied_incentive' => $appliedIncentive,
            'is_dtp_active' => $isDtpEligible,
            'effective_rate' => round($effectiveRate, 2),
            'ptkp_status' => $user->tax_status.'/'.$dependents,
            'ptkp_value' => $ptkp,
        ];
    }

    /**
     * Check for PMK 105/2025 eligibility.
     */
    private function checkDtpEligibility(User $user, float $totalIncome): bool
    {
        $eligibleSectors = ['Tekstil', 'Pakaian Jadi', 'Alas Kaki', 'Furnitur', 'Kulit', 'Pariwisata'];
        $isEligibleSector = in_array($user->industry_sector, $eligibleSectors);

        // PPh 21 DTP 2026 is for monthly gross < 10m. Annual simplified to < 120m.
        return $isEligibleSector && $totalIncome > 0 && ($totalIncome / 12) <= 10000000;
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
