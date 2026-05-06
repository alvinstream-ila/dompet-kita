<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Security\DeadMansSwitch\RecordActivityAction;
use App\Models\Household;
use App\Models\LoginHistory;
use App\Models\User;
use App\Services\SentinelService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function __construct(protected RecordActivityAction $recordActivityAction, protected SentinelService $sentinel) {}

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

        /** @var User $user */
        $user = DB::transaction(function () use ($request) {
            // 1. Create Solo Household first with owner_id as null
            $household = Household::create([
                'id' => (string) Str::uuid(),
                'name' => "Household of {$request->string('name')}",
                'owner_id' => null,
            ]);

            // 2. Create User linked to the household
            $user = User::create([
                'name' => (string) $request->string('name'),
                'email' => (string) $request->string('email'),
                'password' => Hash::make((string) $request->string('password')),
                'household_id' => $household->id,
            ]);

            // 3. Update Household with the actual owner_id
            $household->update(['owner_id' => $user->id]);

            return $user;
        });

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
            'message' => 'Registrasi akun berhasil. Instruksi verifikasi email telah dikirimkan.',
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

        $user = User::where('email', (string) $request->string('email'))->first();

        if (! $user instanceof User || ! Hash::check((string) $request->string('password'), (string) $user->password)) {
            // 🚨 Audit Log: Track failed attempt for security alerts
            LoginHistory::create([
                'user_id' => $user instanceof User ? $user->id : null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'login_at' => now()->toDateTimeString(),
                'status' => 'failed',
                'metadata' => ['attempted_email' => $request->string('email')],
            ]);

            $this->sentinel->notify(
                "Percobaan akses gagal terdeteksi untuk entitas: `{$request->string('email')}`\nIP: `{$request->ip()}`\nDevice: `{$request->userAgent()}`",
                'warning',
                ['title' => 'Security: Authentication Failure']
            );

            throw ValidationException::withMessages([
                'email' => ['Kredensial yang Anda berikan tidak valid.'],
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

        // 🛡️ Regenerate session to prevent fixation
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $this->sentinel->notify(
            "Akses authorized. Sentinel mengonfirmasi integritas sesi dari IP: `{$request->ip()}`.",
            'info',
            ['title' => 'Security: Access Authorized']
        );

        // 🛡️ Check for Two-Factor Authentication
        if ($user->two_factor_enabled) {
            $code = (string) random_int(100000, 999999);
            $user->update([
                'two_factor_code' => Hash::make($code),
                'two_factor_expires_at' => now()->addMinutes(10),
            ]);

            // 💌 Send 2FA Code via Email
            try {
                Mail::raw("Protokol Keamanan Dompet Kita\n\nKode verifikasi login Anda: {$code}\nKode ini berlaku selama 10 menit. Pastikan kerahasiaan kode ini untuk menjaga keamanan aset Anda.", function ($message) use ($user): void {
                    $message->to($user->email)
                        ->subject('Keamanan: Kode Verifikasi 2FA');
                });
            } catch (\Exception $e) {
                // Silently log error, but still require 2FA
                Log::error('Gagal kirim email 2FA: '.$e->getMessage());
            }

            return \response()->json([
                'two_factor_required' => true,
                'email' => $user->email,
                'message' => 'Otentikasi dua faktor (2FA) diperlukan. Kode verifikasi telah dikirimkan.',
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
        if (! $user instanceof User) {
            return \response()->json(['message' => 'Sesi tidak valid atau telah berakhir.'], 401);
        }

        if (! Hash::check((string) $request->string('code'), (string) $user->email_verification_code) ||
            ($user->email_verification_expires_at !== null && now()->isAfter($user->email_verification_expires_at))) {
            return \response()->json([
                'message' => 'Kode verifikasi tidak valid atau telah kedaluwarsa. Silakan periksa kembali email Anda.',
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
            'message' => 'Integritas email terverifikasi. Akses platform penuh telah dibuka.',
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

        $user = User::where('email', (string) $request->string('email'))
            ->where('two_factor_expires_at', '>', now())
            ->first();

        if (! $user instanceof User || ! Hash::check((string) $request->string('code'), (string) $user->two_factor_code)) {
            return \response()->json([
                'message' => 'Kode 2FA tidak valid atau telah kedaluwarsa. Silakan coba lagi.',
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
        if (! $user instanceof User) {
            return \response()->json(['message' => 'Unauthenticated'], 401);
        }

        $token = $user->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            Cache::forget("sudo_mode_{$user->id}_{$token->id}");
            $token->delete();
        }

        return \response()->json([
            'message' => 'Sesi diakhiri secara aman.',
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

        $user = $request->user();
        if (! $user instanceof User) {
            return \response()->json(['message' => 'Unauthenticated'], 401);
        }

        $throttleKey = 'sudo_attempts:'.$user->id;

        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return \response()->json([
                'message' => "Terlalu banyak kegagalan verifikasi. Akses dibatasi sementara. Silakan coba lagi dalam {$seconds} detik.",
            ], 429);
        }

        if (! Hash::check((string) $request->string('password'), (string) $user->password)) {
            RateLimiter::hit($throttleKey, 300); // 5 minute penalty
            $remaining = RateLimiter::remaining($throttleKey, 3);

            if ($remaining === 0) {
                // 🚀 Aggressive Security: Force Logout
                $user->tokens()->delete();
                RateLimiter::clear($throttleKey);

                $this->sentinel->notify(
                    "PROTOKOL DARURAT: User `{$user->email}` dipaksa log out setelah 3 kegagalan Sudo berturut-turut. IP: `{$request->ip()}`",
                    'critical',
                    ['title' => 'Security: Forced Logout Triggered']
                );

                return \response()->json([
                    'message' => 'Terlalu banyak kegagalan verifikasi. Demi keamanan, Anda telah dikeluarkan dari sistem. Silakan login kembali.',
                    'action' => 'force_logout',
                ], 401);
            }

            $this->sentinel->notify(
                "Pelanggaran protokol Sudo terdeteksi: Kegagalan otentikasi kata sandi. Sisa percobaan: {$remaining}. IP: `{$request->ip()}`",
                'critical',
                ['title' => 'Security: Sudo Verification Failed']
            );

            return \response()->json([
                'message' => "Verifikasi gagal. Hak akses administratif ditolak. Sisa percobaan: {$remaining}.",
                'remaining' => $remaining,
            ], 401);
        }

        RateLimiter::clear($throttleKey);

        $token = $user->currentAccessToken();
        $tokenId = $token instanceof PersonalAccessToken ? $token->id : 'default';
        $fingerprint = sha1($request->ip().$request->userAgent());
        Cache::put("sudo_mode_{$user->id}_{$tokenId}", $fingerprint, now()->addMinutes(15));

        $this->sentinel->notify(
            "Protokol Sudo diaktifkan. Jendela otoritas tinggi terbuka selama 15 menit oleh IP: `{$request->ip()}`",
            'warning',
            ['title' => 'Security: Sudo Authority Active']
        );

        return \response()->json([
            'message' => 'Akses Sudo dikonfirmasi. Otoritas administratif diberikan sementara.',
        ]);
    }
}
