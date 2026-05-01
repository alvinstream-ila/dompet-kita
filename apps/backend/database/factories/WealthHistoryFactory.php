<?php

namespace Database\Factories;

use App\Models\Household;
use App\Models\User;
use App\Models\WealthHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WealthHistory>
 */
class WealthHistoryFactory extends Factory
{
    protected $model = WealthHistory::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'household_id' => fn (array $attributes) => User::where('id', $attributes['user_id'])->value('household_id') ?? Household::factory(),
            'month' => $this->faker->numberBetween(1, 12),
            'year' => $this->faker->numberBetween(2020, 2026),
            'total_value' => $this->faker->randomFloat(2, 10000, 1000000),
        ];
    }
}
