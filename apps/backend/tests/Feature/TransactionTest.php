<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_transactions(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/transactions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'date',
                        'amount',
                        'category',
                        'type',
                        'description',
                    ],
                ],
            ]);
    }

    public function test_user_can_create_a_transaction(): void
    {
        $user = User::factory()->create();
        $transactionData = [
            'type' => 'expense',
            'category' => 'Food',
            'amount' => 50000,
            'date' => now()->format('Y-m-d'),
            'description' => 'Dinner',
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/transactions', $transactionData);

        $response->assertStatus(201)
            ->assertJsonPath('data.amount', 50000)
            ->assertJsonPath('data.category', 'Food');

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'amount' => 50000,
            'category' => 'Food',
        ]);
    }

    public function test_user_can_update_their_own_transaction(): void
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->putJson("/api/transactions/{$transaction->id}", [
                'amount' => 15000,
                'description' => 'Updated Dinner',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.amount', 15000)
            ->assertJsonPath('data.description', 'Updated Dinner');
    }

    public function test_user_cannot_update_someone_else_transaction(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $transaction = Transaction::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)
            ->putJson("/api/transactions/{$transaction->id}", [
                'amount' => 15000,
            ]);

        // HasUserScope trait results in 404 for unauthorized access
        $response->assertStatus(404);
    }

    public function test_user_can_delete_their_own_transaction(): void
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/transactions/{$transaction->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
    }

    public function test_user_can_see_transaction_summary(): void
    {
        $user = User::factory()->create();

        // Income
        Transaction::factory()->create([
            'user_id' => $user->id,
            'type' => 'income',
            'amount' => 100000,
            'date' => '2024-02-15',
        ]);

        // Expense
        Transaction::factory()->create([
            'user_id' => $user->id,
            'type' => 'expense',
            'amount' => 40000,
            'date' => '2024-02-20',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/transactions/summary?month=1&year=2024'); // Feb is 1 (0-indexed in JS)

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['income', 'expense', 'balance', 'transactions', 'period']])
            ->assertJsonPath('data.income', 100000)
            ->assertJsonPath('data.expense', 40000)
            ->assertJsonPath('data.balance', 60000);
    }

    public function test_user_can_list_transactions_with_month_and_year_filter(): void
    {
        $user = User::factory()->create();

        // Current month (Feb 2024)
        Transaction::factory()->create([
            'user_id' => $user->id,
            'date' => '2024-02-15',
            'amount' => 50000,
        ]);

        // Other month
        Transaction::factory()->create([
            'user_id' => $user->id,
            'date' => '2024-03-15',
            'amount' => 75000,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/transactions?month=1&year=2024');

        $response->assertStatus(200);
        $data = $response->json('data');
        if (!is_array($data)) {
            $this->fail('Response data is not an array');
        }
        /** @var array<int, array<string, mixed>> $data */
        $this->assertCount(1, $data);
        $this->assertEquals(50000, $data[0]['amount'] ?? 0);
    }
}
