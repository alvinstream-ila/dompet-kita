<?php

namespace App\Http\Controllers;

use App\Actions\Security\DeadMansSwitch\RecordActivityAction;
use App\Models\LoginHistory;
use App\Models\User;
use App\Services\SentinelService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected RecordActivityAction $recordActivityAction;

    protected SentinelService $sentinel;

    public function __construct(RecordActivityAction $recordActivityAction, SentinelService $sentinel)
    {
        $this->recordActivityAction = $recordActivityAction;
        $this->sentinel = $sentinel;
    }

    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Register a new user",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Successful registration"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:users,name',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // 🕵️ Log initial registration access
        LoginHistory::create([
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_at' => now()->toDateTimeString(),
            'status' => 'registered',
        ]);

        \event(new Registered($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return \response()->json([
            'message' => 'Registrasi sukses! Langsung kita verifikasi ya, Sayang! ❤️',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Login to the application",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Successful login"),
     *     @OA\Response(response=401, description="Invalid credentials")
     * )
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            // 🚨 Audit Log: Track failed attempt for security alerts
            LoginHistory::create([
                'user_id' => $user ? $user->id : null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'login_at' => now()->toDateTimeString(),
                'status' => 'failed',
                'metadata' => ['attempted_email' => $request->email],
            ]);

            $this->sentinel->notify(
                "Gagal login buat: `{$request->email}`\nIP: `{$request->ip()}`\nDevice: `{$request->userAgent()}`",
                'warning',
                ['title' => 'Curi Data? 🕵️']
            );

            throw ValidationException::withMessages([
                'email' => ['Kredensial yang Anda berikan salah, Sayang.'],
            ]);
        }

        // 🕵️ Log successful login activity
        LoginHistory::create([
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_at' => now()->toDateTimeString(),
            'status' => 'success',
        ]);

        $this->sentinel->notify(
            "Halo Alvin/Ila! Login sukses dari IP: `{$request->ip()}`\nUdah siap kelola harta karun hari ini?",
            'info',
            ['title' => 'Welcome Home! 🛡️']
        );

        // 🛡️ Check for Two-Factor Authentication
        if ($user->two_factor_enabled) {
            $code = random_int(100000, 999999);
            $user->update([
                'two_factor_code' => $code,
                'two_factor_expires_at' => now()->addMinutes(10),
            ]);

            // 💌 Send 2FA Code via Email
            try {
                Mail::raw("Halo Sayang! ❤️\n\nIni kode verifikasi login kamu: {$code}\nKode ini cuma berlaku 10 menit ya. Jangan kasih tahu siapa-siapa, cukup kita aja yang tahu. 😉\n\nSelamat mengelola keuangan bareng!", function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('🛡️ Kode Keamanan Dompet Kita');
                });
            } catch (\Exception $e) {
                // Silently log error, but still require 2FA
                Log::error('Gagal kirim email 2FA: '.$e->getMessage());
            }

            return \response()->json([
                'two_factor_required' => true,
                'email' => $user->email,
                'message' => 'Kode keamanan sudah dikirim ke email kamu, Sayang! ❤️',
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // 💓 Record activity for Dead Man's Switch
        $this->recordActivityAction->execute($user);

        return \response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/email/verify-code",
     *     summary="Verify email with 6-digit OTP code",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="code", type="string", example="123456")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Successful verification"),
     *     @OA\Response(response=401, description="Invalid or expired code")
     * )
     */
    public function verifyEmailCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (! $user) {
            return \response()->json(['message' => 'Silakan login dulu ya, Sayang!'], 401);
        }

        if ($user->email_verification_code !== $request->code ||
            now()->isAfter($user->email_verification_expires_at)) {
            return \response()->json([
                'message' => 'Kode salah atau sudah kedaluwarsa, Sayang. Cek email lagi ya! ❤️',
            ], 422);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            $user->update([
                'email_verification_code' => null,
                'email_verification_expires_at' => null,
            ]);
            \event(new Verified($user));
        }

        return \response()->json([
            'message' => 'Email berhasil diverifikasi! Selamat datang di Dompet Kita, Sayang! ✨❤️',
            'user' => $user,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/verify-2fa",
     *     summary="Verify 2FA code",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *             @OA\Property(property="code", type="string", example="123456")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Successful verification"),
     *     @OA\Response(response=401, description="Invalid code")
     * )
     */
    public function verify2fa(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $user = User::where('email', $request->email)
            ->where('two_factor_code', $request->code)
            ->where('two_factor_expires_at', '>', now())
            ->first();

        if (! $user) {
            return \response()->json([
                'message' => 'Kode salah atau sudah kedaluwarsa, Sayang. Coba lagi ya! ❤️',
            ], 401);
        }

        // Reset code after success
        $user->update([
            'two_factor_code' => null,
            'two_factor_expires_at' => null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // 💓 Record activity for Dead Man's Switch
        $this->recordActivityAction->execute($user);

        return \response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     summary="Logout from the application",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Response(response=200, description="Successful logout"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        Cache::forget("sudo_mode_{$user->id}");
        $user->currentAccessToken()->delete();

        return \response()->json([
            'message' => 'Sampai jumpa lagi, Sayang! ❤️',
        ]);
    }

    /**
     * Sudo Mode Confirmation
     */
    public function sudoConfirm(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (! Hash::check($request->password, $request->user()->password)) {
            $this->sentinel->notify(
                "Gagal verifikasi Sudo Mode dari IP: `{$request->ip()}`",
                'critical',
                ['title' => 'SUDO FAILED 🚨']
            );

            return \response()->json([
                'message' => 'Password salah sayang. Gagal masuk mode Sudo. 🥺',
            ], 401);
        }

        $userId = $request->user()->id;
        Cache::put("sudo_mode_{$userId}", now(), now()->addMinutes(15));

        $this->sentinel->notify(
            "Sudo Mode diaktifkan buat 15 menit ke depan oleh IP: `{$request->ip()}`",
            'warning',
            ['title' => 'SUDO ACTIVE 🛡️']
        );

        return \response()->json([
            'message' => 'Hore! Kamu sekarang di mode Sudo buat 15 menit ke depan sayang! ❤️',
        ]);
    }
}
