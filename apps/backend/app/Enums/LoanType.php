<?php

declare(strict_types=1);

namespace App\Enums;

use App\Traits\EnumExtensions;

/**
 * Enum LoanType
 * Distinguishes between what the user owes and what the user is owed.
 */
enum LoanType: string
{
    use EnumExtensions;

    case DEBT = 'utang';
    case RECEIVABLE = 'piutang';

    /**
     * Human-readable label in Indonesian.
     */
    public function label(): string
    {
        return match ($this) {
            self::DEBT => 'Utang Saya',
            self::RECEIVABLE => 'Piutang (Orang Utang)',
        };
    }

    /**
     * UI-focused color tokens.
     */
    public function color(): string
    {
        return match ($this) {
            self::DEBT => 'rose',
            self::RECEIVABLE => 'emerald',
        };
    }
}
