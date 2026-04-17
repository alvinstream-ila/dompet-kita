<?php

namespace App\Enums;

use App\Traits\EnumExtensions;

/**
 * Enum LoanStatus
 * Lifecycle management for loans and receivables.
 */
enum LoanStatus: string
{
    use EnumExtensions;

    case ACTIVE = 'active';
    case PAID = 'paid';

    /**
     * Human-readable label in Indonesian.
     */
    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Belum Lunas',
            self::PAID => 'Lunas',
        };
    }

    /**
     * UI-focused color tokens.
     */
    public function color(): string
    {
        return match ($this) {
            self::ACTIVE => 'orange',
            self::PAID => 'emerald',
        };
    }
}
