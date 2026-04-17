<?php

namespace App\Enums;

use App\Traits\EnumExtensions;

/**
 * Enum TransactionType
 * High-precision type definition for financial movements.
 */
enum TransactionType: string
{
    use EnumExtensions;

    case INCOME = 'income';
    case EXPENSE = 'expense';

    /**
     * Human-readable label in Indonesian.
     */
    public function label(): string
    {
        return match ($this) {
            self::INCOME => 'Pemasukan',
            self::EXPENSE => 'Pengeluaran',
        };
    }

    /**
     * UI-focused color tokens (Tailwind compatible).
     */
    public function color(): string
    {
        return match ($this) {
            self::INCOME => 'emerald',
            self::EXPENSE => 'rose',
        };
    }

    /**
     * Lucide or Heroicons name.
     */
    public function icon(): string
    {
        return match ($this) {
            self::INCOME => 'trending-up',
            self::EXPENSE => 'trending-down',
        };
    }
}
