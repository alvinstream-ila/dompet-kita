<?php

namespace Database\Factories;

use App\Models\Holiday;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Holiday>
 */
class HolidayFactory extends Factory
{
    protected $model = Holiday::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'household_id' => fn (array $attributes) => \App\Models\User::find($attributes['user_id'])?->household_id ?? \App\Models\Household::factory(),
            'destination' => $this->faker->city . ', ' . $this->faker->country,
            'budget' => $this->faker->randomFloat(2, 500, 5000),
            'funded_amount' => $this->faker->randomFloat(2, 0, 500),
            'start_date' => $this->faker->dateTimeBetween('+1 month', '+2 months'),
            'end_date' => $this->faker->dateTimeBetween('+2 months', '+3 months'),
            'status' => 'planning',
        ];
    }
}
