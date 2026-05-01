<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use App\Enums\TransactionType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TableExistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_transactions_table_exists(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        
        Transaction::create([
            'user_id' => $user->id,
            'amount' => 100,
            'type' => TransactionType::EXPENSE,
            'category' => 'Food',
            'description' => 'Test',
            'date' => now(),
        ]);

        $this->assertEquals(1, Transaction::count());
    }
}
