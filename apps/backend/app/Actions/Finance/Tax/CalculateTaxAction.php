<?php

declare(strict_types=1);

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
     *
     * @return array{year: int, total_income: float, ptkp: float, taxable_income: float, estimated_tax: float, applied_incentive: float, is_dtp_active: bool, effective_rate: float, ptkp_status: string, ptkp_value: float, ter_category: string, monthly_ter_estimate: float}
     */
    public function execute(User $user, int $year): array
    {
        $startOfYear = Carbon::create($year, 1, 1)?->startOfDay() ?? throw new \InvalidArgumentException("Invalid year: {$year}");
        $endOfYear = Carbon::create($year, 12, 31)?->endOfDay() ?? throw new \InvalidArgumentException("Invalid year: {$year}");

        // Sum income (Income type transactions) across the entire household
        $totalIncome = (float) Transaction::where('household_id', $user->household_id)
            ->where('type', TransactionType::INCOME)
            ->whereBetween('date', [$startOfYear, $endOfYear])
            ->where(function ($query) {
                $query->whereNull('metadata->auto_journal')
                    ->orWhere('metadata->auto_journal', false);
            })
            ->sum('amount');

        // Apply PTKP Logic (Upped for 2026 Sovereign Standards)
        $ptkp = $this->ptkpBase;
        $isMarried = str_starts_with($user->tax_status ?? 'TK', 'K');

        if ($isMarried) {
            $ptkp += $this->ptkpExtra;
        }

        // Dependents (Max 3)
        $dependents = min(3, $user->dependents_count ?? 0);
        $ptkp += $dependents * $this->ptkpExtra;

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
            'ter_category' => $this->getTerCategory($user),
            'monthly_ter_estimate' => $this->calculateMonthlyTer($user, $totalIncome / 12),
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
     * Determine TER Category (A, B, C) based on PTKP status.
     * PP 58/2023.
     */
    private function getTerCategory(User $user): string
    {
        $status = $user->tax_status ?? 'TK/0';
        $isMarried = str_starts_with($status, 'K');
        $dependents = $user->dependents_count ?? 0;

        if ($isMarried) {
            return match ($dependents) {
                0 => 'A',
                1, 2 => 'B',
                default => 'C', // K/3
            };
        }

        return match ($dependents) {
            0, 1 => 'A',
            2, 3 => 'B',
            default => 'B',
        };
    }

    /**
     * Calculate monthly TER tax estimate based on Category.
     * Simplified lookup for demonstration.
     */
    private function calculateMonthlyTer(User $user, float $monthlyGross): float
    {
        $category = $this->getTerCategory($user);

        // Thresholds where rate > 0%
        $thresholds = [
            'A' => 5400000,
            'B' => 6200000,
            'C' => 6600000,
        ];

        if ($monthlyGross <= $thresholds[$category]) {
            return 0;
        }

        $rate = match ($category) {
            'A' => $this->getRateCategoryA($monthlyGross),
            'B' => $this->getRateCategoryB($monthlyGross),
            'C' => $this->getRateCategoryC($monthlyGross),
            default => 0,
        };

        return $monthlyGross * $rate;
    }

    private function getRateCategoryA(float $gross): float
    {
        $rates = [
            5650000 => 0.0025,
            5950000 => 0.005,
            6300000 => 0.0075,
            6750000 => 0.01,
            7500000 => 0.0125,
            8500000 => 0.015,
            9500000 => 0.0175,
            10600000 => 0.02,
        ];

        foreach ($rates as $limit => $rate) {
            if ($gross <= $limit) {
                return $rate;
            }
        }

        return 0.05;
    }

    private function getRateCategoryB(float $gross): float
    {
        $rates = [
            6500000 => 0.0025,
            6850000 => 0.005,
            7300000 => 0.0075,
            9200000 => 0.01,
        ];

        foreach ($rates as $limit => $rate) {
            if ($gross <= $limit) {
                return $rate;
            }
        }

        return 0.05;
    }

    private function getRateCategoryC(float $gross): float
    {
        $rates = [
            6950000 => 0.0025,
            7350000 => 0.005,
            7800000 => 0.0075,
            8350000 => 0.01,
        ];

        foreach ($rates as $limit => $rate) {
            if ($gross <= $limit) {
                return $rate;
            }
        }

        return 0.05;
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
