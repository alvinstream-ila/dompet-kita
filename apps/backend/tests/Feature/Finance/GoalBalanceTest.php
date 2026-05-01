<?php

namespace Tests\Feature\Finance;

use App\Models\Goal;
use App\Models\User;
use App\Models\Household;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GoalBalanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_goal_balance_updates_on_transaction_creation(): void
    {
        $user = User::factory()->create();
        $household = Household::factory()->create([
            'owner_id' => $user->id
        ]);
        $user->update(['household_id' => $household->id]);
        $this->actingAs($user);
        
        $goal = Goal::create([
            'user_id' => $user->id,
            'household_id' => $household->id,
            'name' => 'Save for Car',
            'target_amount' => 10000,
            'current_amount' => 0,
            'status' => 'active'
        ]);

        // This will trigger the observer (currently bugged: it won't update current_amount)
        $goal->transactions()->create([
            'user_id' => $user->id,
            'amount' => 500,
            'type' => 'deposit',
            'date' => now()
        ]);

        $refreshed = $goal->fresh();
        $this->assertNotNull($refreshed);
        $this->assertEquals(500, $refreshed->current_amount, "Goal balance should be 500 after deposit");
    }

    public function test_goal_balance_updates_on_transaction_deletion(): void
    {
        $user = User::factory()->create();
        $household = Household::factory()->create([
            'owner_id' => $user->id
        ]);
        $user->update(['household_id' => $household->id]);
        $this->actingAs($user);
        
        $goal = Goal::create([
            'user_id' => $user->id,
            'household_id' => $household->id,
            'name' => 'Save for Car',
            'target_amount' => 10000,
            'current_amount' => 500,
            'status' => 'active'
        ]);

        $transaction = $goal->transactions()->create([
            'user_id' => $user->id,
            'amount' => 500,
            'type' => 'deposit',
            'date' => now()
        ]);

        // Manually adjust for now because observer is broken
        // No manual increment needed anymore - observer handles it

        $transaction->delete();

        $refreshed = $goal->fresh();
        $this->assertNotNull($refreshed);
        $this->assertEquals(500, $refreshed->current_amount, "Goal balance should return to 500 after deleting 500 deposit");
    }
}
