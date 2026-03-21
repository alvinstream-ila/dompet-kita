<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'full_name' => 'sometimes|nullable|string|max:255',
            'avatar_url' => 'sometimes|nullable|string|max:2048',
            'partner_name' => 'sometimes|nullable|string|max:255',
            'anniversary_date' => 'sometimes|nullable|date',
            'timezone' => 'sometimes|string|max:100',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'budget_cycle_start' => 'sometimes|integer|min:1|max:31',
            'is_privacy_mode' => 'sometimes|boolean',
            'is_eco_mode' => 'sometimes|boolean',
            'currency_format' => 'sometimes|string|max:10',
            'exchange_rate' => 'sometimes|numeric|min:0',
            'monthly_budget_limit' => 'sometimes|numeric|min:0',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui ya sayang! ✨',
            'user' => $user
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password lama kamu salah, Sayang. Cek lagi ya! 🥺'
            ], 422);
        }

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Password berhasil diganti! Jaga baik-baik ya Sayang! 🔐💖'
        ]);
    }
}
