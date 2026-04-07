<?php

namespace App\Enums;

use App\Traits\EnumExtensions;

/**
 * Enum ScheduleStatus
 * Operational status for scheduled automated transactions.
 */
enum ScheduleStatus: string
{
    use EnumExtensions;

    case ACTIVE = 'active';
    case PAUSED = 'paused';
    case FINISHED = 'finished';

    /**
     * Human-readable label in Indonesian.
     */
    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Aktif',
            self::PAUSED => 'Jeda',
            self::FINISHED => 'Selesai',
        };
    }

    /**
     * UI-focused color tokens.
     */
    public function color(): string
    {
        return match ($this) {
            self::ACTIVE => 'emerald',
            self::PAUSED => 'amber',
            self::FINISHED => 'slate',
        };
    }
}
