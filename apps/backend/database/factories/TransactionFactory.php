<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date' => $this->faker->date(),
            'amount' => $this->faker->numberBetween(1000, 1000000),
            'category' => $this->faker->word(),
            'sub_category' => $this->faker->word(),
            'type' => $this->faker->randomElement(['income', 'expense']),
            'description' => $this->faker->sentence(),
            'note' => $this->faker->optional()->text(),
            'receipt_url' => $this->faker->optional()->url(),
        ];
    }
}
