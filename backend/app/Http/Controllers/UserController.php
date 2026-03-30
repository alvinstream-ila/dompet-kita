<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * @OA\Put(
     *     path="/user/profile",
     *     summary="Update user profile",
     *     tags={"User"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(mediaType="application/json", @OA\Schema(ref="#/components/schemas/UpdateUserRequest"))
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Profil berhasil diperbarui ya sayang! ✨"),
     *             @OA\Property(property="user", ref="#/components/schemas/UserResource")
     *         )
     *     )
     * )
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'full_name' => 'sometimes|nullable|string|max:255',
            'avatar_url' => 'sometimes|nullable|string|max:2048',
            'partner_name' => 'sometimes|nullable|string|max:255',
            'anniversary_date' => 'sometimes|nullable|date',
            'timezone' => 'sometimes|string|max:100',
            'email' => [
                'sometimes', 
                'string', 
                'email', 
                'max:255', 
                Rule::unique('users')->ignore($user->id)
            ],
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
            'user' => new UserResource($user),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/user/change-password",
     *     summary="Change user password",
     *     tags={"User"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             required={"current_password","new_password","new_password_confirmation"},
     *             @OA\Property(property="current_password", type="string", example="password123"),
     *             @OA\Property(property="new_password", type="string", example="newsecret123"),
     *             @OA\Property(property="new_password_confirmation", type="string", example="newsecret123")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=422, description="Validation Error")
     * )
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if ($user->password && ! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password lama kamu salah, Sayang. Cek lagi ya! 🥺',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password berhasil diganti! Jaga baik-baik ya Sayang! 🔐💖',
        ]);
    }
}
