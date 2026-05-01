<?php

namespace Database\Factories;

use App\Models\Household;
use App\Models\ScheduledTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScheduledTransactionFactory extends Factory
{
    protected $model = ScheduledTransaction::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'household_id' => fn (array $attributes) => User::find($attributes['user_id'])?->household_id ?? Household::factory(),
            'description' => $this->faker->sentence(3),
            'amount' => $this->faker->numberBetween(10000, 500000),
            'type' => 'expense',
            'category' => 'Bills',
            'recurrence' => 'monthly',
            'next_due_date' => now()->addMonth(),
            'status' => 'active',
            'is_auto_execute' => true,
        ];
    }
}
