<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Household;
use App\Models\PartnerInvitation;
use App\Models\User;
use App\Notifications\PartnerInvitationNotification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PartnerController extends Controller
{
    private const INVITATION_SUCCESS_MESSAGE = 'Undangan partner berhasil dikirim.';

    /**
     * Send an invitation to a partner.
     */
    public function invite(Request $request): JsonResponse
    {
        $inviter = $request->user();
        if (! $inviter instanceof User) {
            abort(401);
        }

        $request->validate([
            'email' => [
                'required',
                'email',
                function (string $_, mixed $value, \Closure $fail) use ($inviter): void {
                    if ($inviter->email === $value) {
                        $fail('Anda tidak dapat mengundang diri sendiri.');
                    } elseif ($inviter->partner_id) {
                        $fail('Anda sudah terhubung dengan partner lain.');
                    }
                },
            ],
        ]);

        $inviteeEmail = (string) $request->string('email');
        $invitee = User::where('email', $inviteeEmail)->first();

        // 🛡️ Enumeration Protection: Silent fail if user doesn't exist or isn't verified
        if (! $invitee instanceof User || ! $invitee->email_verified_at) {
            return response()->json([
                'message' => self::INVITATION_SUCCESS_MESSAGE,
            ]);
        }

        if ($invitee->partner_id) {
            return response()->json([
                'message' => self::INVITATION_SUCCESS_MESSAGE,
            ]);
        }

        // 4. Create Invitation
        /** @var PartnerInvitation $invitation */
        $invitation = PartnerInvitation::updateOrCreate(
            ['inviter_id' => $inviter->id, 'email' => $inviteeEmail, 'status' => 'pending'],
            [
                'token' => Str::random(40),
                'expires_at' => Carbon::now()->addDays(7),
            ]
        );

        // 5. Notify
        $invitee->notify(new PartnerInvitationNotification($inviter, (string) $invitation->token));

        return response()->json([
            'message' => self::INVITATION_SUCCESS_MESSAGE,
        ]);
    }

    /**
     * Get invitation details by token.
     */
    public function getInvitation(string $token): JsonResponse
    {
        // 🛡️ Scope Bypass: Invitation must be found by token across all households
        $invitation = PartnerInvitation::withoutGlobalScopes()
            ->with('inviter')
            ->where('token', $token)
            ->where('status', 'pending')
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (! $invitation instanceof PartnerInvitation) {
            return response()->json(['message' => 'Undangan tidak ditemukan atau telah kedaluwarsa.'], 404);
        }

        $inviter = $invitation->inviter;
        if (! $inviter instanceof User) {
            return response()->json(['message' => 'Pengundang tidak ditemukan.'], 404);
        }

        return response()->json([
            'inviter_name' => $inviter->name,
            'email' => $invitation->email,
        ]);
    }

    /**
     * Accept a partner invitation.
     */
    public function accept(Request $request): JsonResponse
    {
        $request->validate(['token' => 'required|string']);
        $token = (string) $request->string('token');

        $invitation = PartnerInvitation::withoutGlobalScopes()
            ->where('token', $token)
            ->where('status', 'pending')
            ->where('expires_at', '>', Carbon::now())
            ->lockForUpdate()
            ->first();

        if (! $invitation instanceof PartnerInvitation) {
            abort(404, 'Proses aktivasi gagal. Token tidak valid atau kedaluwarsa.');
        }

        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        if ($user->email !== $invitation->email) {
            abort(403, 'Undangan ini dikirim untuk email lain.');
        }

        $inviter = User::find($invitation->inviter_id);
        if (! $inviter instanceof User) {
            abort(404, 'Pengundang tidak ditemukan.');
        }

        if ($inviter->household_id && User::where('household_id', $inviter->household_id)->count() >= 2) {
            throw ValidationException::withMessages([
                'household' => ['Household sudah mencapai kapasitas maksimal.'],
            ]);
        }

        DB::transaction(function () use ($user, $inviter, $invitation): void {
            if ($user->partner_id || $inviter->partner_id) {
                throw ValidationException::withMessages([
                    'partner' => ['Salah satu pihak sudah terhubung dengan partner lain.'],
                ]);
            }

            // 1. Ensure Inviter has a Household
            if (! $inviter->household_id) {
                $household = Household::create([
                    'id' => (string) Str::uuid(),
                    'name' => "Household of {$inviter->name}",
                    'owner_id' => $inviter->id,
                ]);
                $inviter->update(['household_id' => $household->id]);
                // 🛡️ Critical: Refresh the model so household_id is available in memory
                $inviter->refresh();

                // Also migrate inviter's existing records to the new household
                $this->reassignUserRecordsToHousehold($inviter->id, (string) $inviter->household_id);
            }

            // 2. Cross-link partners
            $user->update([
                'partner_id' => $inviter->id,
                'household_id' => $inviter->household_id,
            ]);
            $inviter->update(['partner_id' => $user->id]);

            // 3. Migrate user's existing records to the new household
            $this->reassignUserRecordsToHousehold($user->id, (string) $inviter->household_id);

            // 4. Mark as accepted
            $invitation->update(['status' => 'accepted']);

            // 🛡️ Switch Logic: Invalidate current user's Sudo Mode when joining a new household
            Cache::forget("sudo_mode_{$user->id}_{$user->currentAccessToken()?->id}");
        });

        return response()->json([
            'message' => 'Tautan partner berhasil diaktifkan. Anda sekarang terhubung dengan '.$inviter->name.'.',
        ]);
    }

    /**
     * Unlink partner.
     */
    public function unlink(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $oldHouseholdId = $user->household_id;
        $partner = $user->partner;

        DB::transaction(function () use ($user, $partner, $oldHouseholdId): void {
            // 1. Break partner link
            if ($partner instanceof User) {
                $partner->update(['partner_id' => null]);

                // Create new separate household for partner
                $partnerHousehold = Household::create([
                    'id' => (string) Str::uuid(),
                    'name' => "Household of {$partner->name}",
                    'owner_id' => $partner->id,
                ]);
                $partner->update(['household_id' => $partnerHousehold->id]);
                $this->reassignUserRecordsToHousehold($partner->id, $partnerHousehold->id);
            }

            $user->update(['partner_id' => null]);

            // 2. Create new separate household for current user
            $userHousehold = Household::create([
                'id' => (string) Str::uuid(),
                'name' => "Household of {$user->name}",
                'owner_id' => $user->id,
            ]);
            $user->update(['household_id' => $userHousehold->id]);
            $this->reassignUserRecordsToHousehold($user->id, $userHousehold->id);

            // 🛡️ Orphaned Ledger Cleanup: Delete the old household if it's now empty
            if ($oldHouseholdId) {
                $stillHasUsers = User::where('household_id', $oldHouseholdId)->exists();
                if (! $stillHasUsers) {
                    Household::where('id', $oldHouseholdId)->delete();
                }
            }
        });

        return response()->json([
            'message' => 'Tautan partner berhasil dilepaskan.',
        ]);
    }

    /**
     * Reassign all finance records of a user to a specific household.
     */
    private function reassignUserRecordsToHousehold(int $userId, string $householdId): void
    {
        $financeTables = [
            'transactions',
            'assets',
            'loans',
            'goals',
            'holidays',
            'asset_transactions',
            'budgets',
            'transaction_insights',
            'scheduled_transactions',
            'goal_transactions',
            'holiday_transactions',
            'chat_histories',
            'wealth_histories',
            'financial_wisdoms',
            'legacy_vault_reports',
            'login_histories',
            'asset_price_histories',
            'firewall_logs',
        ];

        foreach ($financeTables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)
                    ->where('user_id', $userId)
                    ->update(['household_id' => $householdId]);
            }
        }
    }
}
