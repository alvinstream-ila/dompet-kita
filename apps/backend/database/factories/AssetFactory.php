<?php

namespace Database\Factories;

use App\Models\Asset;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetFactory extends Factory
{
    protected $model = Asset::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'household_id' => fn (array $attributes) => \App\Models\User::find($attributes['user_id'])?->household_id ?? \App\Models\Household::factory(),
            'name' => $this->faker->word(),
            'type' => \App\Enums\AssetType::CASH->value,
            'value' => $this->faker->numberBetween(1000, 1000000),
            'quantity' => 1,
            'is_market_synced' => false,
            'invested_capital' => 0,
        ];
    }
}
