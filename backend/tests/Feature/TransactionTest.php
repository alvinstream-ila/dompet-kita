<?php

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can list transactions', function () {
    $user = User::factory()->create();
    Transaction::factory()->count(3)->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)
                     ->getJson('/api/transactions');

    $response->assertStatus(200)
             ->assertJsonCount(3, 'data');
});

test('user can list transactions with month and year filter', function () {
    $user = User::factory()->create();
    // Transaction for March 2024
    Transaction::factory()->create([
        'user_id' => $user->id,
        'date' => '2024-03-15',
    ]);
    // Transaction for April 2024
    Transaction::factory()->create([
        'user_id' => $user->id,
        'date' => '2024-04-05',
    ]);

    $response = $this->actingAs($user)
                     ->getJson('/api/transactions?month=2&year=2024'); // 0-indexed month 2 = March

    $response->assertStatus(200)
             ->assertJsonCount(1, 'data');
});

test('user can create a transaction', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
                     ->postJson('/api/transactions', [
                         'type' => 'expense',
                         'amount' => 50000,
                         'category' => 'Food',
                         'description' => 'Dinner',
                         'date' => now()->format('Y-m-d'),
                     ]);

    $response->assertStatus(201)
             ->assertJsonFragment(['amount' => 50000]);
});

test('user can see transaction summary', function () {
    $user = User::factory()->create();
    Transaction::factory()->create([
        'user_id' => $user->id,
        'type' => 'income',
        'amount' => 100000,
        'date' => '2024-03-10',
    ]);
    Transaction::factory()->create([
        'user_id' => $user->id,
        'type' => 'expense',
        'amount' => 40000,
        'date' => '2024-03-15',
    ]);

    $response = $this->actingAs($user)
                     ->getJson('/api/transactions/summary?month=2&year=2024');

    $response->assertStatus(200)
             ->assertJsonStructure(['income', 'expense', 'balance', 'transactions', 'period'])
             ->assertJsonPath('income', 100000)
             ->assertJsonPath('expense', 40000);
});

test('user can update their own transaction', function () {
    $user = User::factory()->create();
    $transaction = Transaction::factory()->create(['user_id' => $user->id, 'amount' => 10000]);

    $response = $this->actingAs($user)
                     ->putJson("/api/transactions/{$transaction->id}", [
                         'amount' => 15000,
                     ]);

    $response->assertStatus(200)
             ->assertJsonPath('amount', 15000);
});

test('user can delete their own transaction', function () {
    $user = User::factory()->create();
    $transaction = Transaction::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)
                     ->deleteJson("/api/transactions/{$transaction->id}");

    $response->assertStatus(204);
    $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
});

test('user cannot update someone else transaction', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $transaction = Transaction::factory()->create(['user_id' => $user2->id]);

    $response = $this->actingAs($user1)
                     ->putJson("/api/transactions/{$transaction->id}", [
                         'amount' => 15000,
                     ]);

    $response->assertStatus(403);
});
