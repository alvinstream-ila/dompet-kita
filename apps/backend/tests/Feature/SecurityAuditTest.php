<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(RefreshDatabase::class);

test('it rejects malicious file uploads in media controller', function () {
    /** @var TestCase $this */
    $user = User::factory()->create();
    config([
        'filesystems.disks.storj.key' => 'fake-key',
        'filesystems.disks.storj.url' => 'http://localhost/storage',
    ]);
    Storage::fake('storj');

    // Create a fake PHP file that should be rejected
    $maliciousFile = UploadedFile::fake()->create('shell.php', 100, 'application/x-php');

    $response = $this->actingAs($user)
        ->postJson('/api/media/upload', [
            'file' => $maliciousFile,
        ]);

    // Validation should fail
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['file']);
});

test('it accepts valid image file uploads', function () {
    /** @var TestCase $this */
    $user = User::factory()->create();
    config([
        'filesystems.disks.storj.key' => 'fake-key',
        'filesystems.disks.storj.url' => 'http://localhost/storage',
    ]);
    Storage::fake('storj');

    $validImage = UploadedFile::fake()->image('receipt.jpg');

    $response = $this->actingAs($user)
        ->postJson('/api/media/upload', [
            'file' => $validImage,
        ]);

    $response->assertStatus(200)
        ->assertJson(['success' => true]);
});

test('it prevents unauthorized access to other users transactions', function () {
    /** @var TestCase $this */
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

    // HasUserScope trait masks cross-user resources as Not Found (404)
    $response->assertStatus(404);
});

test('it verifies branding variables are set correctly', function () {
    $appName = config('app.name');
    $mailFromName = config('mail.from.name');

    expect($appName)->toBe('Dompet Kita');
    expect($mailFromName)->toBe('Dompet Kita');
});

test('it verifies secure mail configuration', function () {
    expect(config('mail.mailers.smtp.encryption'))->toBe('tls');
    expect((int) config('mail.mailers.smtp.port'))->toBe(587);
});
