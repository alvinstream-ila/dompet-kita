<?php

namespace Tests\Feature\Finance;

use App\Actions\Finance\PerformCfoAnalysisAction;
use App\Actions\Finance\GetWealthStatusAction;
use App\Actions\Finance\GetFinancialReportAction;
use App\Models\Asset;
use App\Models\Household;
use App\Models\Transaction;
use App\Models\User;
use App\Services\AI\AiProviderManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class MultiTenantSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $userA;
    protected User $userB;
    protected Household $householdA;
    protected Household $householdB;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create Households first
        $this->householdA = Household::factory()->create(['name' => 'Household A']);
        $this->householdB = Household::factory()->create(['name' => 'Household B']);

        // 2. Create Users associated with their households
        $this->userA = User::factory()->create(['name' => 'User A', 'household_id' => $this->householdA->id]);
        $this->userB = User::factory()->create(['name' => 'User B', 'household_id' => $this->householdB->id]);

        // 3. Update Households with correct owners
        $this->householdA->update(['owner_id' => $this->userA->id]);
        $this->householdB->update(['owner_id' => $this->userB->id]);
    }

    /**
     * Test that CFO Analysis Action strictly scopes data to the user's household.
     */
    public function test_cfo_analysis_isolation(): void
    {
        $this->actingAs($this->userA);
        
        // 1. Create data in HH A
        Transaction::factory()->create([
            'user_id' => $this->userA->id,
            'household_id' => $this->householdA->id,
            'amount' => 1000000,
            'type' => 'income',
            'date' => now(),
        ]);

        // 2. Create data in HH B (This should BE INVISIBLE to User A)
        Transaction::factory()->create([
            'user_id' => $this->userB->id,
            'household_id' => $this->householdB->id,
            'amount' => 50000000,
            'type' => 'income',
        ]);

        // 3. Mock AI Provider to see what data is being sent
        $mockAi = Mockery::mock(AiProviderManager::class);
        /** @var \Mockery\Expectation $expectation */
        $expectation = $mockAi->expects('generateText');
        $expectation->once()
            ->with(Mockery::on(function (string $prompt): bool {
                // The prompt should contain the 1M income but NOT the 50M income
                return str_contains($prompt, '1000000') && !str_contains($prompt, '50000000');
            }))
            ->andReturn(json_encode(['findings' => []]));

        $this->app->instance(AiProviderManager::class, $mockAi);

        // 4. Run Action
        $action = app(PerformCfoAnalysisAction::class);
        $action->execute($this->userA, now()->format('Y-m'));
    }

    /**
     * Test that Wealth Status Action strictly scopes data to the user's household.
     */
    public function test_wealth_status_isolation(): void
    {
        $this->actingAs($this->userA);

        // 1. Create Asset in HH A
        Asset::create([
            'user_id' => $this->userA->id,
            'household_id' => $this->householdA->id,
            'name' => 'Account A',
            'type' => \App\Enums\AssetType::CASH,
            'value' => 1000000,
        ]);

        // 2. Create Asset in HH B
        Asset::create([
            'user_id' => $this->userB->id,
            'household_id' => $this->householdB->id,
            'name' => 'Account B',
            'type' => \App\Enums\AssetType::CASH,
            'value' => 999000000,
        ]);

        // 3. Run Action for User A
        $action = app(GetWealthStatusAction::class);
        $data = $action->execute($this->userA);

        // Verify total wealth is only 1M, not 1,000,000,000
        $this->assertEquals(1000000, $data['assets_goals']['total_wealth']);
    }

    /**
     * Test that Financial Report Action strictly scopes data to the user's household.
     */
    public function test_financial_report_isolation(): void
    {
        $this->actingAs($this->userA);

        // 1. Create Income in HH A
        Transaction::factory()->create([
            'user_id' => $this->userA->id,
            'household_id' => $this->householdA->id,
            'amount' => 1000000,
            'type' => 'income',
            'date' => now(),
        ]);

        // 2. Create Income in HH B
        Transaction::factory()->create([
            'user_id' => $this->userB->id,
            'household_id' => $this->householdB->id,
            'amount' => 50000000,
            'type' => 'income',
            'date' => now(),
        ]);

        // 3. Run Action for User A
        $action = app(GetFinancialReportAction::class);
        $report = $action->execute(now()->format('Y-m'), $this->userA);

        // Verify total income is only 1M
        $this->assertEquals(1000000, $report['income']);
    }
}
