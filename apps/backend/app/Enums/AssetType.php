<?php

declare(strict_types=1);

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
    case STOCK = 'stock';
    case CRYPTO = 'crypto';
    case MUTUAL_FUND = 'mutual_fund';
    case OBLIGASI = 'obligasi';
    case COMMODITY = 'commodity';
    case OTHER = 'other';

    /**
     * Human-readable label in Indonesian.
     */
    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Tunai',
            self::BANK => 'Bank/e-Wallet',
            self::INVESTMENT => 'Investasi Umum',
            self::STOCK => 'Saham',
            self::CRYPTO => 'Kripto',
            self::MUTUAL_FUND => 'Reksadana',
            self::OBLIGASI => 'Obligasi',
            self::COMMODITY => 'Komoditas',
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
            self::STOCK => 'emerald',
            self::CRYPTO => 'violet',
            self::MUTUAL_FUND => 'orange',
            self::OBLIGASI => 'rose',
            self::COMMODITY => 'yellow',
            self::OTHER => 'slate',
        };
    }

    /**
     * Logic for market price synchronization.
     */
    public function canSyncMarket(): bool
    {
        return in_array($this, [
            self::INVESTMENT,
            self::STOCK,
            self::CRYPTO,
            self::MUTUAL_FUND,
            self::COMMODITY,
        ]);
    }
}
