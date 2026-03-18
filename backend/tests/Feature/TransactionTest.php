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
