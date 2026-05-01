<?php

namespace Database\Factories;

use App\Enums\LoanStatus;
use App\Enums\LoanType;
use App\Models\Household;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class LoanFactory extends Factory
{
    protected $model = Loan::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'household_id' => fn (array $attributes) => User::find($attributes['user_id'])?->household_id ?? Household::factory(),
            'contact_name' => $this->faker->name(),
            'type' => LoanType::DEBT->value,
            'amount' => $this->faker->numberBetween(100000, 5000000),
            'remaining_amount' => $this->faker->numberBetween(100000, 5000000),
            'description' => $this->faker->sentence(),
            'due_date' => now()->addMonths(6),
            'status' => LoanStatus::ACTIVE->value,
        ];
    }
}
