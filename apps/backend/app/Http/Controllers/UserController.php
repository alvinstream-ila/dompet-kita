<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * @OA\Put(
     *     path="/user/profile",
     *     summary="Update user profile",
     *     tags={"User"},
     *     security={{"sanctum":{}}},
     *
     *     @OA\RequestBody(
     *
     *         @OA\MediaType(mediaType="application/json", @OA\Schema(ref="#/components/schemas/UpdateUserRequest"))
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Profil berhasil diperbarui ya sayang! ✨"),
     *             @OA\Property(property="user", ref="#/components/schemas/UserResource")
     *         )
     *     )
     * )
     */
    public function update(UpdateUserRequest $request): JsonResponse
    {
        $user = $request->user();
        if (!$user instanceof \App\Models\User) {
            return \response()->json(['message' => 'Unauthenticated'], 401);
        }
        $validated = $request->validated();

        $user->update($validated);

        return \response()->json([
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
     *
     *     @OA\RequestBody(
     *
     *         @OA\JsonContent(
     *             required={"current_password","new_password","new_password_confirmation"},
     *
     *             @OA\Property(property="current_password", type="string", example="password123"),
     *             @OA\Property(property="new_password", type="string", example="newsecret123"),
     *             @OA\Property(property="new_password_confirmation", type="string", example="newsecret123")
     *         )
     *     ),
     *
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
        if (!$user instanceof \App\Models\User) {
            return \response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (! Hash::check((string) $request->string('current_password'), (string) $user->password)) {
            return \response()->json([
                'message' => 'Password lama kamu salah, Sayang. Cek lagi ya! 🥺',
            ], 422);
        }

        $user->update([
            'password' => Hash::make((string) $request->string('new_password')),
        ]);

        return \response()->json([
            'message' => 'Password berhasil diganti! Jaga baik-baik ya Sayang! 🔐💖',
        ]);
    }
}
