<?php

namespace Database\Factories;

use App\Models\Goal;
use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Goal>
 */
class GoalFactory extends Factory
{
    protected $model = Goal::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'household_id' => fn (array $attributes) => User::find($attributes['user_id'])?->household_id ?? Household::factory(),
            'name' => $this->faker->words(3, true),
            'target_amount' => $this->faker->randomFloat(2, 1000, 100000),
            'current_amount' => $this->faker->randomFloat(2, 0, 1000),
            'deadline' => $this->faker->dateTimeBetween('now', '+1 year'),
            'category' => $this->faker->randomElement(['Retirement', 'Emergency Fund', 'Travel', 'House']),
            'status' => 'active',
        ];
    }
}
