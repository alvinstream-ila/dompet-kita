<?php

namespace Database\Factories;

use App\Models\Loan;
use Illuminate\Database\Eloquent\Factories\Factory;

class LoanFactory extends Factory
{
    protected $model = Loan::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'household_id' => fn (array $attributes) => \App\Models\User::find($attributes['user_id'])?->household_id ?? \App\Models\Household::factory(),
            'contact_name' => $this->faker->name(),
            'type' => \App\Enums\LoanType::DEBT->value,
            'amount' => $this->faker->numberBetween(100000, 5000000),
            'remaining_amount' => $this->faker->numberBetween(100000, 5000000),
            'description' => $this->faker->sentence(),
            'due_date' => now()->addMonths(6),
            'status' => \App\Enums\LoanStatus::ACTIVE->value,
        ];
    }
}
