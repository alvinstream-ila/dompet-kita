<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\AssetType;
use App\Models\Asset;
use App\Models\Household;
use App\Models\PartnerInvitation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Tests\TestCase;

class HouseholdLifecycleTest extends TestCase
{
    use RefreshDatabase;

    protected function enableSudo(User $user): void
    {
        $fingerprint = sha1('127.0.0.1'.'Symfony');
        Cache::put("sudo_mode_{$user->id}_default", $fingerprint, now()->addMinutes(10));
    }

    public function test_it_prevents_joining_a_household_that_is_already_full(): void
    {
        // 1. Setup a full household (2 members)
        $inviter = User::factory()->create();
        $household = $inviter->household;
        assert($household instanceof Household);
        $existingPartner = User::factory()->create(['household_id' => $household->id, 'partner_id' => $inviter->id]);
        $inviter->update(['partner_id' => $existingPartner->id]);

        // 2. Create an invitation from the inviter (even though full, the invitation might exist)
        $inviteeEmail = 'new@example.com';
        PartnerInvitation::create([
            'inviter_id' => $inviter->id,
            'household_id' => $household->id,
            'email' => $inviteeEmail,
            'token' => 'test-token',
            'status' => 'pending',
            'expires_at' => Carbon::now()->addDay(),
        ]);

        // 3. Create a third user who tries to accept
        $invitee = User::factory()->create(['email' => $inviteeEmail]);
        assert($invitee instanceof User);

        // Bypass Sudo for accept
        $this->enableSudo($invitee);

        $response = $this->actingAs($invitee)
            ->postJson('/api/partner/accept', ['token' => 'test-token']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['household' => 'Household sudah mencapai kapasitas maksimal.']);
    }

    public function test_it_cleans_up_orphaned_households_on_unlink(): void
    {
        // 1. Setup a partnered household
        $user1 = User::factory()->create();
        assert($user1 instanceof User);
        $household = $user1->household;
        assert($household instanceof Household);
        $user2 = User::factory()->create(['household_id' => $household->id, 'partner_id' => $user1->id]);
        assert($user2 instanceof User);
        $user1->update(['partner_id' => $user2->id]);

        $this->assertDatabaseHas('households', ['id' => $household->id]);

        // Bypass Sudo for unlink
        $this->enableSudo($user1);

        // 2. Unlink
        $response = $this->actingAs($user1)->postJson('/api/partner/unlink');
        $response->assertStatus(200);

        // 3. Verify old household is gone
        $this->assertSoftDeleted('households', ['id' => $household->id]);

        // 4. Verify users have new households
        $user1->refresh();
        $user2->refresh();
        $this->assertNotEquals($household->id, $user1->household_id);
        $this->assertNotEquals($household->id, $user2->household_id);
        $this->assertDatabaseHas('households', ['id' => $user1->household_id]);
        $this->assertDatabaseHas('households', ['id' => $user2->household_id]);
    }

    public function test_it_prevents_currency_change_if_assets_exist(): void
    {
        $household = new Household;
        $household->id = (string) Str::uuid();
        $household->name = 'Test Household';
        $household->owner_id = 0;
        $household->save();

        $user = new User;
        $user->name = 'Test User';
        $user->email = 'test-'.uniqid().'@example.com';
        $user->password = bcrypt('password');
        $user->household_id = $household->id;
        $user->currency_format = 'IDR';
        $user->email_verified_at = now();
        $user->save();

        $asset = new Asset;
        $asset->user_id = $user->id;
        $asset->household_id = $user->household_id;
        $asset->name = 'Test Asset';
        $asset->type = AssetType::CASH;
        $asset->value = 1000;
        $asset->quantity = 1;
        $asset->save();

        // Bypass Sudo for profile update
        $this->enableSudo($user);

        $response = $this->actingAs($user)->putJson('/api/user/profile', [
            'name' => 'Alvin New',
            'currency_format' => 'USD',
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Mata uang tidak dapat diubah karena Anda sudah memiliki aset terdaftar.']);
    }

    public function test_it_masks_partner_email_in_privacy_mode(): void
    {
        $user1 = User::factory()->create(['is_privacy_mode' => true]);
        assert($user1 instanceof User);
        $user2 = User::factory()->create(['email' => 'secret_partner@example.com']);
        assert($user2 instanceof User);
        $user1->update(['partner_id' => $user2->id]);
        $user2->update(['partner_id' => $user1->id]);

        // Bypass Sudo for profile update (using update to get UserResource)
        $this->enableSudo($user1);

        $response = $this->actingAs($user1)->putJson('/api/user/profile', [
            'name' => $user1->name,
        ]);

        $response->assertStatus(200);
        // Expecting something like se**************@example.com
        // Our regex: preg_replace('/(?<=.{2}).(?=.*@)/', '*', ...)
        // secret_partner@example.com -> se************@example.com
        $response->assertJsonPath('user.partner_email', 'se************@example.com');
    }
}
