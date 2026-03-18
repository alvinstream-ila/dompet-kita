<?php

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can get financial summary', function () {
    $user = User::factory()->create();
    Transaction::factory()->create([
        'user_id' => $user->id,
        'type' => 'income',
        'amount' => 100000,
        'date' => now()->format('Y-m-d')
    ]);
    Transaction::factory()->create([
        'user_id' => $user->id,
        'type' => 'expense',
        'amount' => 40000,
        'date' => now()->format('Y-m-d')
    ]);

    $response = $this->actingAs($user)
                     ->getJson('/api/transactions/summary?month=' . (now()->month - 1) . '&year=' . now()->year);

    $response->assertStatus(200)
             ->assertJsonFragment(['income' => 100000, 'expense' => 40000]);
});
