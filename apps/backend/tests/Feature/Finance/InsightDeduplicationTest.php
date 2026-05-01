<?php

namespace Tests\Feature\Finance;

use App\Models\Household;
use App\Models\Transaction;
use App\Models\TransactionInsight;
use App\Models\User;
use App\Services\Cfo\QuantumInsightEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class InsightDeduplicationTest extends TestCase
{
    use RefreshDatabase;

    private const ENDPOINT = '/api/ai/quantum-insights';

    public function test_insights_are_deduplicated_at_household_level(): void
    {
        // 1. Setup Household with two partners
        /** @var User $alvin */
        $alvin = User::factory()->create(['name' => 'Alvin']);
        $household = Household::create([
            'id' => (string) Str::uuid(),
            'name' => 'Sovereign Lab',
            'owner_id' => $alvin->id
        ]);
        $alvin->update(['household_id' => $household->id]);
        
        /** @var User $ila */
        $ila = User::factory()->create([
            'name' => 'Ila',
            'household_id' => $household->id
        ]);

        // 2. Mock AI finding
        $finding = [
            'type' => 'trend',
            'title' => 'Struktur Modal Optimal',
            'content' => 'Data menunjukkan efisiensi tinggi.',
            'impact_value' => 100,
            'action_url' => '/transactions'
        ];

        $engine = app(QuantumInsightEngine::class);

        // 3. Alvin generates an insight
        $this->actingAs($alvin);
        $method = new \ReflectionMethod(QuantumInsightEngine::class, 'persistInsight');
        $method->invoke($engine, $alvin, $finding);

        $this->assertEquals(1, TransactionInsight::count());
        $insight = TransactionInsight::first();
        $this->assertNotNull($insight);
        $this->assertNotNull($insight->user);
        $this->assertEquals('Alvin', $insight->user->name);

        // 4. Ila tries to generate the SAME insight (same title)
        $this->actingAs($ila);
        $method->invoke($engine, $ila, $finding);

        // 5. Verification: Count should still be 1
        $this->assertEquals(1, TransactionInsight::count(), 'Insight should be deduplicated at household level.');
        
        // 6. Verify visibility: Ila can see Alvin's insight via the correct endpoint
        $response = $this->getJson(self::ENDPOINT);
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.title', 'Struktur Modal Optimal');
    }

    public function test_insights_are_isolated_between_different_households(): void
    {
        // 1. Setup two different households
        /** @var User $userA */
        $userA = User::factory()->create();
        $h1 = Household::create([
            'id' => (string) Str::uuid(),
            'name' => 'Household A',
            'owner_id' => $userA->id
        ]);
        $userA->update(['household_id' => $h1->id]);

        /** @var User $userB */
        $userB = User::factory()->create();
        $h2 = Household::create([
            'id' => (string) Str::uuid(),
            'name' => 'Household B',
            'owner_id' => $userB->id
        ]);
        $userB->update(['household_id' => $h2->id]);

        $finding = [
            'type' => 'trend',
            'title' => 'Unique Insight',
            'content' => 'Content',
            'impact_value' => 0
        ];

        $engine = app(QuantumInsightEngine::class);
        $method = new \ReflectionMethod(QuantumInsightEngine::class, 'persistInsight');

        // 2. User A generates insight
        $this->actingAs($userA);
        $method->invoke($engine, $userA, $finding);

        // 3. User B generates SAME title insight
        $this->actingAs($userB);
        $method->invoke($engine, $userB, $finding);

        // 4. Verification: Should have 2 insights total (isolated)
        $this->assertEquals(2, TransactionInsight::withoutGlobalScopes()->count());
        
        // 5. Check visibility via correct endpoint
        $this->actingAs($userA);
        $this->getJson(self::ENDPOINT)->assertJsonCount(1);

        $this->actingAs($userB);
        $this->getJson(self::ENDPOINT)->assertJsonCount(1);
    }
}
