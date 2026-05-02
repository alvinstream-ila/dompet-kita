<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AssetCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_asset(): void
    {
        $user = User::factory()->create([
            'email' => 'alvinnostream@gmail.com',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/assets', [
            'name' => 'Test Asset Debug',
            'type' => 'cash',
            'value' => 100000,
            'quantity' => 1,
            'unit' => 'unit',
            'invested_capital' => 100000,
        ]);

        if ($response->status() !== 201) {
            \Log::error('Asset Creation Failed in Test: '.$response->getContent());
        }

        $response->assertStatus(201);
    }
}
