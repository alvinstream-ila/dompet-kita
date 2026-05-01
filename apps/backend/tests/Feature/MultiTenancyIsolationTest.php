<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\Household;
use App\Models\Loan;
use App\Models\ScheduledTransaction;
use App\Models\LegacyVaultReport;
use App\Models\Goal;
use App\Models\Holiday;
use App\Models\TransactionInsight;
use App\Models\WealthHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class MultiTenancyIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_access_other_household_assets(): void
    {
        $household1 = Household::factory()->create(['owner_id' => 0]);
        $user1 = User::factory()->create(['household_id' => $household1->id]);
        $household1->update(['owner_id' => $user1->id]);
        Asset::factory()->create(['household_id' => $household1->id, 'name' => 'House 1', 'user_id' => $user1->id]);

        $household2 = Household::factory()->create(['owner_id' => 0]);
        $user2 = User::factory()->create(['household_id' => $household2->id]);
        $household2->update(['owner_id' => $user2->id]);
        Asset::factory()->create(['household_id' => $household2->id, 'name' => 'House 2', 'user_id' => $user2->id]);

        $response = $this->actingAs($user1)->getJson('/api/assets');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'House 1');
    }

    public function test_user_cannot_access_other_household_loans(): void
    {
        $household1 = Household::factory()->create();
        $user1 = User::factory()->create(['household_id' => $household1->id]);
        $household1->update(['owner_id' => $user1->id]);
        Loan::factory()->create(['household_id' => $household1->id, 'contact_name' => 'Loan 1', 'user_id' => $user1->id]);

        $household2 = Household::factory()->create();
        $user2 = User::factory()->create(['household_id' => $household2->id]);
        $household2->update(['owner_id' => $user2->id]);
        Loan::factory()->create(['household_id' => $household2->id, 'contact_name' => 'Loan 2', 'user_id' => $user2->id]);

        $response = $this->actingAs($user1)->getJson('/api/loans');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.contact_name', 'Loan 1');
    }

    public function test_user_cannot_access_other_household_scheduled_transactions(): void
    {
        $household1 = Household::factory()->create();
        $user1 = User::factory()->create(['household_id' => $household1->id]);
        $household1->update(['owner_id' => $user1->id]);
        ScheduledTransaction::factory()->create(['household_id' => $household1->id, 'description' => 'Sched 1', 'user_id' => $user1->id]);

        $household2 = Household::factory()->create();
        $user2 = User::factory()->create(['household_id' => $household2->id]);
        $household2->update(['owner_id' => $user2->id]);
        ScheduledTransaction::factory()->create(['household_id' => $household2->id, 'description' => 'Sched 2', 'user_id' => $user2->id]);

        $response = $this->actingAs($user1)->getJson('/api/scheduled-transactions');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.description', 'Sched 1');
    }

    public function test_user_cannot_download_other_household_legacy_reports(): void
    {
        $household1 = Household::factory()->create();
        $user1 = User::factory()->create(['household_id' => $household1->id]);
        $household1->update(['owner_id' => $user1->id]);
        
        // 🛡️ Activate Sudo Mode for User 1
        \Illuminate\Support\Facades\Cache::put("sudo_mode_{$user1->id}", true, 900);

        $report1 = LegacyVaultReport::create([
            'household_id' => $household1->id,
            'user_id' => $user1->id,
            'storage_path' => 'test1.pdf',
            'filename' => 'test1.pdf',
            'disk' => 'local'
        ]);

        $household2 = Household::factory()->create();
        $user2 = User::factory()->create(['household_id' => $household2->id]);
        $household2->update(['owner_id' => $user2->id]);
        $report2 = LegacyVaultReport::create([
            'household_id' => $household2->id,
            'user_id' => $user2->id,
            'storage_path' => 'test2.pdf',
            'filename' => 'test2.pdf',
            'disk' => 'local'
        ]);

        $response = $this->actingAs($user1)->getJson("/api/legacy/download/{$report2->id}");
        $response->assertStatus(404);
    }

    public function test_user_cannot_access_other_household_goals(): void
    {
        $household1 = Household::factory()->create();
        $user1 = User::factory()->create(['household_id' => $household1->id]);
        $household1->update(['owner_id' => $user1->id]);
        Goal::factory()->create(['household_id' => $household1->id, 'name' => 'Goal 1', 'user_id' => $user1->id]);

        $household2 = Household::factory()->create();
        $user2 = User::factory()->create(['household_id' => $household2->id]);
        $household2->update(['owner_id' => $user2->id]);
        Goal::factory()->create(['household_id' => $household2->id, 'name' => 'Goal 2', 'user_id' => $user2->id]);

        $response = $this->actingAs($user1)->getJson('/api/goals');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Goal 1');
    }

    public function test_user_cannot_access_other_household_holidays(): void
    {
        $household1 = Household::factory()->create();
        $user1 = User::factory()->create(['household_id' => $household1->id]);
        $household1->update(['owner_id' => $user1->id]);
        Holiday::factory()->create(['household_id' => $household1->id, 'destination' => 'Bali', 'user_id' => $user1->id]);

        $household2 = Household::factory()->create();
        $user2 = User::factory()->create(['household_id' => $household2->id]);
        $household2->update(['owner_id' => $user2->id]);
        Holiday::factory()->create(['household_id' => $household2->id, 'destination' => 'Paris', 'user_id' => $user2->id]);

        $response = $this->actingAs($user1)->getJson('/api/holidays');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.destination', 'Bali');
    }

    public function test_user_cannot_access_other_household_insights(): void
    {
        $household1 = Household::factory()->create();
        $user1 = User::factory()->create(['household_id' => $household1->id]);
        $household1->update(['owner_id' => $user1->id]);
        TransactionInsight::factory()->create(['household_id' => $household1->id, 'title' => 'Insight 1', 'user_id' => $user1->id]);

        $household2 = Household::factory()->create();
        $user2 = User::factory()->create(['household_id' => $household2->id]);
        $household2->update(['owner_id' => $user2->id]);
        TransactionInsight::factory()->create(['household_id' => $household2->id, 'title' => 'Insight 2', 'user_id' => $user2->id]);

        $response = $this->actingAs($user1)->getJson('/api/ai/quantum-insights');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonPath('0.title', 'Insight 1');
    }

    public function test_user_cannot_access_other_household_wealth_history(): void
    {
        $household1 = Household::factory()->create();
        $user1 = User::factory()->create(['household_id' => $household1->id]);
        $household1->update(['owner_id' => $user1->id]);
        WealthHistory::factory()->create([
            'household_id' => $household1->id, 
            'user_id' => $user1->id,
            'year' => 2025,
            'month' => 1
        ]);

        $household2 = Household::factory()->create();
        $user2 = User::factory()->create(['household_id' => $household2->id]);
        $household2->update(['owner_id' => $user2->id]);
        WealthHistory::factory()->create([
            'household_id' => $household2->id, 
            'user_id' => $user2->id,
            'year' => 2025,
            'month' => 1
        ]);

        $response = $this->actingAs($user1)->getJson('/api/wealth-history');

        $response->assertStatus(200);
        // It returns an array of history + current month point. 
        // We expect only 2 points (1 historical from H1, 1 current from H1)
        $response->assertJsonCount(2);
    }
}
