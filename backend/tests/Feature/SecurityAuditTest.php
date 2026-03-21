<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('it rejects malicious file uploads in media controller', function () {
    $user = User::factory()->create();
    Storage::fake('storj');

    $maliciousFile = UploadedFile::fake()->create('shell.php', 100, 'application/x-php');

    $response = $this->actingAs($user)
        ->postJson('/api/media/upload', [
            'file' => $maliciousFile,
        ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['file']);
});

test('it accepts valid image file uploads', function () {
    $user = User::factory()->create();
    Storage::fake('storj');

    $validImage = UploadedFile::fake()->image('receipt.jpg');

    $response = $this->actingAs($user)
        ->postJson('/api/media/upload', [
            'file' => $validImage,
        ]);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);
});

test('it prevents unauthorized access to other users transactions', function () {
    $alvin = User::factory()->create();
    $ila = User::factory()->create();
    
    $transaction = Transaction::factory()->create([
        'user_id' => $alvin->id,
        'description' => 'Alvin Confidential',
    ]);

    $response = $this->actingAs($ila)
        ->putJson("/api/transactions/{$transaction->id}", [
            'description' => 'Hacked by Ila',
        ]);

    $response->assertStatus(403);
});

test('it verifies branding variables are set correctly', function () {
    $appName = config('app.name');
    $mailFromName = config('mail.from.name');

    expect($appName)->toBe('Dompet Kita');
    expect($mailFromName)->toBe('Dompet Kita');
});

test('it verifies secure mail configuration', function () {
    expect(config('mail.mailers.smtp.encryption'))->toBe('tls');
    expect(config('mail.mailers.smtp.port'))->toBe('587');
});
