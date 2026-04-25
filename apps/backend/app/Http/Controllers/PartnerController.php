<?php

namespace App\Http\Controllers;

use App\Models\Household;
use App\Models\PartnerInvitation;
use App\Models\User;
use App\Notifications\PartnerInvitationNotification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class PartnerController extends Controller
{
    /**
     * Send an invitation to a partner.
     */
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
                function ($_attribute, $value, $fail) use ($inviter) {
                    if ($inviter->email === $value) {
                        $fail('Anda tidak dapat mengundang diri sendiri.');
                    }
                    if ($inviter->partner_id) {
                        $fail('Anda sudah terhubung dengan partner lain. Harap lepaskan tautan terlebih dahulu.');
                    }

                    $invitee = User::where('email', $value)->first();
                    if (! $invitee instanceof User || ! $invitee->email_verified_at) {
                        $fail('Email partner belum terdaftar atau belum diverifikasi.');
                    }
                },
            ],
        ]);

        $inviteeEmail = (string) $request->string('email');
        $invitee = User::where('email', $inviteeEmail)->firstOrFail();

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
            'message' => 'Undangan partner berhasil dikirim.',
        ]);
    }

    /**
     * Get invitation details by token.
     */
    public function getInvitation(string $token): JsonResponse
    {
        $invitation = PartnerInvitation::with('inviter')
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
        $request->validate(['token' => 'required']);

        $token = (string) $request->string('token');

        $invitation = PartnerInvitation::where('token', $token)
            ->where('status', 'pending')
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (! $invitation instanceof PartnerInvitation) {
            return response()->json(['message' => 'Proses aktivasi gagal. Token tidak valid atau kedaluwarsa.'], 404);
        }

        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $inviter = User::find($invitation->inviter_id);

        if (! $inviter instanceof User) {
            return response()->json(['message' => 'Pengundang tidak ditemukan.'], 404);
        }

        DB::transaction(function () use ($user, $inviter, $invitation) {
            // 1. Ensure Inviter has a Household
            if (! $inviter->household_id) {
                $household = Household::create([
                    'id' => (string) Str::uuid(),
                    'name' => "Household of {$inviter->name}",
                    'owner_id' => $inviter->id,
                ]);
                $inviter->update(['household_id' => $household->id]);

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

        $partner = $user->partner;

        DB::transaction(function () use ($user, $partner) {
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
