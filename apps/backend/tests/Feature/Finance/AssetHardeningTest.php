<?php

namespace Tests\Feature\Finance;

use App\Actions\Finance\Asset\FundAssetAction;
use App\Actions\Finance\Asset\WithdrawAssetAction;
use App\Actions\Finance\Tax\CalculateTaxAction;
use App\Enums\AssetType;
use App\Models\Asset;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BudgetService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class AssetHardeningTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // 1. Create household first
        $household = \App\Models\Household::factory()->create([
            'name' => 'Test Household'
        ]);

        // 2. Create user with custom budget_cycle_start and household_id
        $this->user = User::factory()->create([
            'budget_cycle_start' => 25,
            'household_id' => $household->id
        ]);

        // 3. Update household owner
        $household->update(['owner_id' => $this->user->id]);

        $this->actingAs($this->user);
    }

    /**
     * Test that internal asset transfers do NOT record global journal entries.
     */
    public function test_internal_transfers_do_not_record_journal(): void
    {
        $cash = Asset::create([
            'user_id' => $this->user->id,
            'household_id' => $this->user->household_id,
            'name' => 'Cash',
            'type' => AssetType::CASH,
            'value' => 1000000,
            'invested_capital' => 1000000,
        ]);

        $gold = Asset::create([
            'user_id' => $this->user->id,
            'household_id' => $this->user->household_id,
            'name' => 'Gold',
            'type' => AssetType::COMMODITY,
            'value' => 0,
            'invested_capital' => 0,
        ]);

        // Action: Fund Gold from Cash
        $action = app(FundAssetAction::class);
        $action->execute($this->user, $gold, [
            'amount' => 500000,
            'source_asset_id' => $cash->id,
            'description' => 'Beli emas',
        ]);

        // Verify balances
        $cashRefreshed = $cash->fresh();
        $this->assertNotNull($cashRefreshed);
        $this->assertEquals(500000, $cashRefreshed->value);

        $goldRefreshed = $gold->fresh();
        $this->assertNotNull($goldRefreshed);
        $this->assertEquals(500000, $goldRefreshed->value);

        // Verify Transaction count (should be 2: one for each asset created/updated)
        // The important part is that no NEW manual transaction was created by the action.
        $this->assertEquals(2, Transaction::count(), 'Internal transfer should only maintain existing asset journals.');
        
        // Verify total amount in ledger is still 1M
        $this->assertEquals(1000000, Transaction::sum('amount'));
    }

    /**
     * Test that external funding DOES record global journal entry.
     */
    public function test_external_funding_records_journal(): void
    {
        $cash = Asset::create([
            'user_id' => $this->user->id,
            'household_id' => $this->user->household_id,
            'name' => 'Cash',
            'type' => AssetType::CASH,
            'value' => 0,
        ]);

        $action = app(FundAssetAction::class);
        $action->execute($this->user, $cash, [
            'amount' => 1000000,
            'source_asset_id' => null,
            'description' => 'Top up dari gaji',
        ]);

        // Verify global transaction exists
        $this->assertEquals(1, Transaction::count(), 'External funding should create global transaction.');
        $transaction = Transaction::first();
        $this->assertNotNull($transaction);
        $this->assertEquals(1000000, $transaction->amount);
    }

    /**
     * Test that tax calculation excludes auto-journaled transactions.
     */
    public function test_tax_calculation_excludes_auto_journals(): void
    {
        // 1. Manual Income (Salary)
        Transaction::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'income',
            'amount' => 10000000,
            'category' => 'Salary',
            'date' => now(),
            'metadata' => ['auto_journal' => false],
        ]);

        // 2. Auto-journaled Income (Asset Liquidation) - SHOULD BE EXCLUDED
        Transaction::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'income',
            'amount' => 5000000,
            'category' => 'Investment',
            'date' => now(),
            'metadata' => ['auto_journal' => true],
        ]);

        $action = app(CalculateTaxAction::class);
        $result = $action->execute($this->user, (int) now()->year);

        // Total income should only be 10,000,000
        $this->assertEquals(10000000, $result['total_income']);
    }

    /**
     * Test that budget cycle dates respect custom start day.
     */
    public function test_budget_cycle_respects_custom_start_day(): void
    {
        $service = app(BudgetService::class);
        
        // If today is May 1st and startDay is 25th
        // The current cycle should start on April 25th and end on May 24th
        $fixedDate = Carbon::create(2026, 5, 1);
        Carbon::setTestNow($fixedDate);

        $dates = $service->getBudgetCycleDates(null, null, 25);

        $this->assertEquals('2026-04-25', $dates['start']->toDateString());
        $this->assertEquals('2026-05-24', $dates['end']->toDateString());

        Carbon::setTestNow(); // Reset
    }
}
