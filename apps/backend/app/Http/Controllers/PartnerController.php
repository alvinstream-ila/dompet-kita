<?php

namespace App\Http\Controllers;

use App\Models\PartnerInvitation;
use App\Models\User;
use App\Notifications\PartnerInvitationNotification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        $request->validate([
            'email' => 'required|email',
        ]);

        $inviter = $request->user();
        if (!$inviter instanceof User) {
            abort(401);
        }

        $inviteeEmail = (string) $request->string('email');

        // 1. Check if inviting self
        if ($inviter->email === $inviteeEmail) {
            return response()->json(['message' => 'Sayang, gak bisa undang diri sendiri... hehe 😁'], 422);
        }

        // 2. Check if already has a partner
        if ($inviter->partner_id) {
            return response()->json(['message' => 'Kamu sudah punya partner, Sayang. Unlink dulu ya if you want to change.'], 422);
        }

        // 3. Find user and ensure verified
        $invitee = User::where('email', $inviteeEmail)->first();
        if (! $invitee instanceof User || ! $invitee->email_verified_at) {
            return response()->json(['message' => 'Ups! Pasangan kamu harus sudah terdaftar dan verifikasi email dulu ya, Sayang! ✨'], 422);
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
            'message' => 'Undangan berhasil dikirim! Kabari pasangan kamu ya! 💌✨',
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
            return response()->json(['message' => 'Undangan tidak ditemukan atau sudah kadaluarsa, Sayang. 🥺'], 404);
        }

        $inviter = $invitation->inviter;
        if (!$inviter instanceof User) {
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
            return response()->json(['message' => 'Gagal menerima undangan. Cek lagi ya Sayang!'], 404);
        }

        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

        $inviter = User::find($invitation->inviter_id);

        if (! $inviter instanceof User) {
            return response()->json(['message' => 'Pengundang tidak ditemukan.'], 404);
        }

        // Cross-link
        $user->update(['partner_id' => $inviter->id]);
        $inviter->update(['partner_id' => $user->id]);

        // Mark as accepted
        $invitation->update(['status' => 'accepted']);

        return response()->json([
            'message' => 'Yay! Sekarang kamu dan '.$inviter->name.' resmi terhubung sebagai partner! 🥳❤️',
        ]);
    }

    /**
     * Unlink partner.
     */
    public function unlink(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

        $partner = $user->partner;

        if ($partner instanceof User) {
            $partner->update(['partner_id' => null]);
        }

        $user->update(['partner_id' => null]);

        return response()->json([
            'message' => 'Hubungan partner berhasil dilepas. Tetap semangat kumpulin aset ya! ✨',
        ]);
    }
}
