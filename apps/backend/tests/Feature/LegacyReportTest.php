<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(RefreshDatabase::class);

test('it blocks authenticated user from accessing legacy report without sudo', function (): void {
    /** @var TestCase $this */
    /** @var User $user */
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->get('/api/ai/legacy/report');

    // If it's a 200 or 500, it means the SudoMode middleware was bypassed.
    // (500 might happen if the real Action fails due to missing PDF dependencies in test).
    // If it's 403, it's still blocked.

    $status = $response->getStatusCode();

    expect($status)->toBe(403);
});

test('it still requires sudo for legacy snapshot creation', function (): void {
    /** @var TestCase $this */
    /** @var User $user */
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->postJson('/api/legacy/snapshot');

    $response->assertStatus(403);
    $response->assertJson(['sudo_required' => true]);
});
