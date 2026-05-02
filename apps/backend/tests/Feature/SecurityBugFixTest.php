<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordOTPNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class SecurityBugFixTest extends TestCase
{
    use RefreshDatabase;

    private const RESET_EMAIL = 'reset@example.com';

    private const SUDO_TEST_ROUTE = '/api/test/ai-health';

    public function test_email_verification_code_is_hashed_and_verifiable(): void
    {
        Notification::fake();

        /** @var User $user */
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $user->sendEmailVerificationNotification();

        Notification::assertSentTo($user, VerifyEmailNotification::class, function ($notification) use ($user) {
            $code = $notification->code;

            // Verify that it's hashed in DB
            $refreshed = $user->fresh();
            $this->assertNotNull($refreshed);
            $this->assertNotNull($refreshed->email_verification_code);
            $this->assertTrue(Hash::check($code, $refreshed->email_verification_code));

            // Test API verification
            $response = $this->actingAs($user)->postJson('/api/email/verify-code', [
                'code' => $code,
            ]);

            $response->assertStatus(200);
            $refreshed = $user->fresh();
            $this->assertNotNull($refreshed);
            $this->assertNotNull($refreshed->email_verified_at);

            return true;
        });
    }

    public function test_password_reset_otp_is_hashed_and_verifiable(): void
    {
        Notification::fake();

        /** @var User $user */
        $user = User::factory()->create([
            'email' => self::RESET_EMAIL,
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => self::RESET_EMAIL,
        ]);

        $response->assertStatus(200);

        Notification::assertSentTo($user, ResetPasswordOTPNotification::class, function ($notification) use ($user) {
            $code = $notification->code;

            // Verify that it's hashed in DB
            $refreshed = $user->fresh();
            $this->assertNotNull($refreshed);
            $this->assertNotNull($refreshed->otp_reset_code);
            $this->assertTrue(Hash::check($code, $refreshed->otp_reset_code));

            // Test password reset
            $resetResponse = $this->postJson('/api/reset-password', [
                'email' => self::RESET_EMAIL,
                'code' => $code,
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

            $resetResponse->assertStatus(200);
            $refreshed = $user->fresh();
            $this->assertNotNull($refreshed);
            $this->assertIsString($refreshed->password);
            $this->assertTrue(Hash::check('newpassword123', $refreshed->password));

            return true;
        });
    }

    public function test_sudo_mode_timeout_and_verification(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        // 1. Initially should fail (no sudo in cache)
        $response = $this->actingAs($user)->getJson(self::SUDO_TEST_ROUTE);
        $response->assertStatus(403)
            ->assertJson(['sudo_required' => true]);

        // 2. Confirm Sudo
        $confirmResponse = $this->actingAs($user)->postJson('/api/sudo/confirm', [
            'password' => 'password', // Default factory password
        ]);
        $confirmResponse->assertStatus(200);

        // 3. Should now pass
        $passResponse = $this->actingAs($user)->getJson(self::SUDO_TEST_ROUTE);
        $passResponse->assertStatus(200);

        // 4. Test Timeout (Simulate expired sudo — forget the key, mirroring real TTL expiry)
        // The SudoMode middleware uses Cache::get() and fingerprinting; real expiry happens via TTL.
        // In tests we simulate expiry by deleting the key directly.
        Cache::forget("sudo_mode_{$user->id}_default");

        $timeoutResponse = $this->actingAs($user)->getJson(self::SUDO_TEST_ROUTE);
        $timeoutResponse->assertStatus(403);
    }
}
