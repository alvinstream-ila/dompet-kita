<?php

namespace Tests\Feature\Finance;

use App\Models\Budget;
use App\Models\Household;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BudgetService;
use App\Enums\TransactionType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetPrivacyTest extends TestCase
{
    use RefreshDatabase;

    protected BudgetService $budgetService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->budgetService = new BudgetService();
    }

    /**
     * Test that budget usage is isolated per household.
     */
    public function test_budget_usage_is_isolated_per_household(): void
    {
        // 1. Setup User A and User B in different households
        $userA = User::factory()->create();
        $householdA = Household::factory()->create(['owner_id' => $userA->id]);
        $userA->update(['household_id' => $householdA->id]);

        $userB = User::factory()->create();
        $householdB = Household::factory()->create(['owner_id' => $userB->id]);
        $userB->update(['household_id' => $householdB->id]);

        // 2. Create identical budget categories for both
        $category = 'Food';
        Budget::create([
            'user_id' => $userA->id,
            'household_id' => $householdA->id,
            'category' => $category,
            'limit' => 1000,
        ]);

        Budget::create([
            'user_id' => $userB->id,
            'household_id' => $householdB->id,
            'category' => $category,
            'limit' => 2000,
        ]);

        // 3. User B spends money
        Transaction::factory()->create([
            'user_id' => $userB->id,
            'household_id' => $householdB->id,
            'category' => $category,
            'amount' => 500,
            'type' => TransactionType::EXPENSE,
            'date' => now(),
        ]);

        // 4. Check User A's budget usage (Acting as User A)
        $this->actingAs($userA);
        $usageA = $this->budgetService->getBudgetUsage($userA);
        
        $foodUsageA = collect($usageA)->firstWhere('category', $category);
        $this->assertNotNull($foodUsageA);
        $this->assertEquals(0, $foodUsageA['used'], 'User A should not see User B\'s transactions from a different household.');

        // 5. User A spends money
        Transaction::factory()->create([
            'user_id' => $userA->id,
            'household_id' => $householdA->id,
            'category' => $category,
            'amount' => 200,
            'type' => TransactionType::EXPENSE,
            'date' => now(),
        ]);
        
        $usageAUpdated = $this->budgetService->getBudgetUsage($userA);
        $foodUsageAUpdated = collect($usageAUpdated)->firstWhere('category', $category);
        $this->assertNotNull($foodUsageAUpdated);
        $this->assertEquals(200, $foodUsageAUpdated['used']);
    }

    /**
     * Test that partners in the same household share budget and usage.
     */
    public function test_partners_share_budget_usage(): void
    {
        // 1. Setup Alvin and Ila in the same household
        $alvin = User::factory()->create();
        $household = Household::factory()->create(['owner_id' => $alvin->id]);
        $alvin->update(['household_id' => $household->id]);

        $ila = User::factory()->create();
        $ila->update(['household_id' => $household->id]);

        $category = 'Family';
        Budget::create([
            'user_id' => $alvin->id,
            'household_id' => $household->id,
            'category' => $category,
            'limit' => 5000,
        ]);

        // 2. Alvin spends money
        Transaction::factory()->create([
            'user_id' => $alvin->id,
            'household_id' => $household->id,
            'category' => $category,
            'amount' => 1000,
            'type' => TransactionType::EXPENSE,
            'date' => now(),
        ]);

        // 3. Ila spends money
        Transaction::factory()->create([
            'user_id' => $ila->id,
            'household_id' => $household->id,
            'category' => $category,
            'amount' => 1500,
            'type' => TransactionType::EXPENSE,
            'date' => now(),
        ]);

        // 4. Check usage as Ila
        $this->actingAs($ila);
        $usageIla = $this->budgetService->getBudgetUsage($ila);
        $familyUsage = collect($usageIla)->firstWhere('category', $category);

        $this->assertNotNull($familyUsage);
        $this->assertEquals(2500, $familyUsage['used'], 'Ila should see combined usage for the household.');
        $this->assertEquals(5000, $familyUsage['limit'], 'Ila should see the budget set by Alvin.');
    }
}
