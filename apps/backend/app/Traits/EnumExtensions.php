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
     *
     * @return array<string|int, string>
     */
    public static function labels(): array
    {
        return array_reduce(self::cases(), function (array $carry, $case): array {
            /** @var string|int $value */
            $value = $case->value;
            $carry[$value] = $case->label();

            return $carry;
        }, []);
    }

    /**
     * Get select-friendly options array.
     *
     * @return array<int, array{label: string, value: string|int, color: string, icon: string|null}>
     */
    public static function options(): array
    {
        return array_map(fn ($case) => [
            'label' => $case->label(),
            'value' => $case->value,
            /** @phpstan-ignore function.alreadyNarrowedType, function.impossibleType */
            'color' => method_exists($case, 'color') ? $case->color() : 'gray',
            /** @phpstan-ignore function.alreadyNarrowedType, function.impossibleType */
            'icon' => method_exists($case, 'icon') ? $case->icon() : null,
        ], self::cases());
    }

    /**
     * Get all raw values.
     *
     * @return array<int, string|int>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
