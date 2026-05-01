<?php

namespace Database\Factories;

use App\Enums\AssetType;
use App\Models\Asset;
use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Asset>
 */
class AssetFactory extends Factory
{
    protected $model = Asset::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'household_id' => fn (array $attributes) => User::where('id', $attributes['user_id'])->value('household_id') ?? Household::factory(),
            'name' => $this->faker->word(),
            'type' => AssetType::CASH->value,
            'value' => $this->faker->numberBetween(1000, 1000000),
            'quantity' => 1,
            'is_market_synced' => false,
            'invested_capital' => 0,
        ];
    }
}
