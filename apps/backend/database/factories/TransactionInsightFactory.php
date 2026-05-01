<?php

namespace Database\Factories;

use App\Models\TransactionInsight;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TransactionInsight>
 */
class TransactionInsightFactory extends Factory
{
    protected $model = TransactionInsight::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'household_id' => fn (array $attributes) => \App\Models\User::find($attributes['user_id'])?->household_id ?? \App\Models\Household::factory(),
            'type' => $this->faker->randomElement(['trend', 'leak', 'achievement']),
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraph(),
            'status' => 'new',
            'impact_value' => $this->faker->randomFloat(2, 0, 1000),
        ];
    }
}
