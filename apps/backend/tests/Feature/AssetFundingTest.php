<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetFundingTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Asset $bank;

    protected Asset $investment;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->bank = Asset::create([
            'user_id' => $this->user->id,
            'name' => 'Bank BCA',
            'type' => 'bank',
            'value' => 5000000,
            'invested_capital' => 5000000,
        ]);
        $this->investment = Asset::create([
            'user_id' => $this->user->id,
            'name' => 'Emas Antam',
            'type' => 'investment',
            'value' => 1000000,
            'invested_capital' => 1000000,
        ]);
    }

    public function test_user_can_fund_asset_from_external_source(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/assets/{$this->investment->id}/fund", [
                'amount' => 500000,
                'description' => 'Top up bulanan',
            ]);

        $response->assertStatus(200);

        $this->investment->refresh();
        $this->assertEquals(1500000, $this->investment->value);
        $this->assertEquals(1500000, $this->investment->invested_capital);

        $this->assertDatabaseHas('asset_transactions', [
            'asset_id' => $this->investment->id,
            'amount' => 500000,
            'type' => 'funding',
        ]);
    }

    public function test_user_can_fund_asset_from_another_asset(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/assets/{$this->investment->id}/fund", [
                'amount' => 1000000,
                'source_asset_id' => $this->bank->id,
            ]);

        $response->assertStatus(200);

        $this->investment->refresh();
        $this->bank->refresh();

        $this->assertEquals(2000000, $this->investment->value);
        $this->assertEquals(4000000, $this->bank->value);

        // Check capital tracking
        $this->assertEquals(2000000, $this->investment->invested_capital);
        $this->assertEquals(4000000, $this->bank->invested_capital);
    }

    public function test_user_can_withdraw_from_asset(): void
    {
        // Simulate profit first
        $this->investment->update(['value' => 1500000]); // Capital 1jt, Value 1.5jt (500k profit)

        $response = $this->actingAs($this->user)
            ->postJson("/api/assets/{$this->investment->id}/withdraw", [
                'amount' => 600000,
            ]);

        $response->assertStatus(200);

        $this->investment->refresh();
        $this->assertEquals(900000, $this->investment->value);

        // Capital logic: 1.5jt value, 1jt capital. Withdraw 600k.
        // My logic: decrement capital by min(capital, amount).
        // 1jt - 600k = 400k capital remaining.
        $this->assertEquals(400000, $this->investment->invested_capital);
    }

    public function test_withdrawal_moves_funds_to_recipient_asset(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/assets/{$this->investment->id}/withdraw", [
                'amount' => 500000,
                'recipient_asset_id' => $this->bank->id,
            ]);

        $response->assertStatus(200);

        $this->investment->refresh();
        $this->bank->refresh();

        $this->assertEquals(500000, $this->investment->value);
        $this->assertEquals(5500000, $this->bank->value);
        $this->assertEquals(5500000, $this->bank->invested_capital);
    }
}
