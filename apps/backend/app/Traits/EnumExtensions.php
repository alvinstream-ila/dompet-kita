<?php

namespace App\Traits;

/**
 * Trait EnumExtensions
 * Standardizes metadata and helper methods for Enums.
 */
trait EnumExtensions
{
    /**
     * Get all labels indexed by value.
     */
    public static function labels(): array
    {
        return array_reduce(self::cases(), function ($carry, $case) {
            $carry[$case->value] = $case->label();

            return $carry;
        }, []);
    }

    /**
     * Get select-friendly options array.
     */
    public static function options(): array
    {
        return array_map(fn ($case) => [
            'label' => $case->label(),
            'value' => $case->value,
            'color' => method_exists($case, 'color') ? $case->color() : 'gray',
            'icon' => method_exists($case, 'icon') ? $case->icon() : null,
        ], self::cases());
    }

    /**
     * Get all raw values.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
