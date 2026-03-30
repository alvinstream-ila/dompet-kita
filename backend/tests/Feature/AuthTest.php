<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can login with correct credentials', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['access_token', 'user']);
});

test('authenticated user can get their profile', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson('/api/user');

    $response->assertStatus(200)
        ->assertJsonFragment(['email' => $user->email]);
});
