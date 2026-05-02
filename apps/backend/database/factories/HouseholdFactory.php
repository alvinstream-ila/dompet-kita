<?php

namespace Database\Factories;

use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * @extends Factory<Household>
 */
class HouseholdFactory extends Factory
{
    protected $model = Household::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'name' => $this->faker->lastName.' Household',
            'owner_id' => 0, // Placeholder
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Household $household) {
            if ($household->owner_id === 0) {
                Schema::withoutForeignKeyConstraints(function () use ($household) {
                    $owner = User::factory()->create([
                        'household_id' => $household->id,
                    ]);
                    $household->update(['owner_id' => $owner->id]);
                });
            }
        });
    }
}
