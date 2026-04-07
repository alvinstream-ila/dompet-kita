<?php

namespace App\Enums;

use App\Traits\EnumExtensions;

/**
 * Enum AssetType
 * Categorization for personalized wealth tracking.
 */
enum AssetType: string
{
    use EnumExtensions;

    case CASH = 'cash';
    case BANK = 'bank';
    case INVESTMENT = 'investment';
    case OTHER = 'other';

    /**
     * Human-readable label in Indonesian.
     */
    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Tunai',
            self::BANK => 'Bank/e-Wallet',
            self::INVESTMENT => 'Investasi',
            self::OTHER => 'Lainnya',
        };
    }

    /**
     * UI-focused color tokens.
     */
    public function color(): string
    {
        return match ($this) {
            self::CASH => 'amber',
            self::BANK => 'blue',
            self::INVESTMENT => 'indigo',
            self::OTHER => 'slate',
        };
    }

    /**
     * Logic for market price synchronization.
     */
    public function canSyncMarket(): bool
    {
        return $this === self::INVESTMENT;
    }
}
