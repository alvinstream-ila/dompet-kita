<?php

declare(strict_types=1);

namespace App\Enums;

use App\Traits\EnumExtensions;

/**
 * Enum RecurrenceFrequency
 * Defines schedules for recurring financial tasks.
 */
enum RecurrenceFrequency: string
{
    use EnumExtensions;

    case DAILY = 'daily';
    case WEEKLY = 'weekly';
    case MONTHLY = 'monthly';
    case YEARLY = 'yearly';

    /**
     * Human-readable label in Indonesian.
     */
    public function label(): string
    {
        return match ($this) {
            self::DAILY => 'Harian',
            self::WEEKLY => 'Mingguan',
            self::MONTHLY => 'Bulanan',
            self::YEARLY => 'Tahunan',
        };
    }
}
