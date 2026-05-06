<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

test('new user can register and triggers verification', function (): void {
    Mail::fake();

    $response = $this->postJson('/api/register', [
        'name' => 'Alvin Test',
        'email' => 'alvin.test@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonFragment(['message' => 'Registrasi akun berhasil. Instruksi verifikasi email telah dikirimkan.']);

    $this->assertDatabaseHas('users', [
        'email' => 'alvin.test@example.com',
    ]);

    $user = User::where('email', 'alvin.test@example.com')->firstOrFail();

    // Check if verification code was generated
    expect($user->email_verification_code)->not->toBeNull();
    expect($user->email_verification_expires_at)->not->toBeNull();
});
