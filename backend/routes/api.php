<?php

/** Forced Redeploy: Social Auth Support 2026-03-19 **/

use App\Http\Controllers\AIController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WealthHistoryController;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

use Spatie\Honeypot\Http\Middleware\ProtectAgainstSpam;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/register', [AuthController::class, 'register'])->middleware(['throttle:3,1', ProtectAgainstSpam::class]);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])->middleware(['throttle:3,1', ProtectAgainstSpam::class]);
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->name('password.reset')->middleware(['throttle:3,1', ProtectAgainstSpam::class]);

// Email Verification
Route::any('/email/verify/{id}/{hash}', function (Request $request) {
    Log::info('Email Verification Attempt', [
        'method' => $request->method(),
        'id' => $request->id,
        'hash' => $request->hash,
        'full_url' => $request->fullUrl(),
        'has_valid_signature' => $request->hasValidSignature(),
    ]);

    if (! $request->hasValidSignature()) {
        Log::warning('Verification Signature Mismatch', [
            'request_url' => $request->fullUrl(),
            'config_app_url' => config('app.url'),
            'client_ip' => $request->ip(),
        ]);

        return response()->json(['message' => 'Link verifikasi tidak valid atau sudah kadaluarsa sayang. 🥺'], 401);
    }

    $user = User::findOrFail($request->id);

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new Verified($user));
    }

    return response()->json(['message' => 'Hore! Email kamu sudah terverifikasi sayang! ✨']);
})->name('verification.verify');

Route::middleware('auth:sanctum')->post('/email/verification-notification', function (Request $request) {
    if ($request->user()->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email kamu sudah terverifikasi sayang! ❤️']);
    }

    // Increase execution time as SMTP can be slow from certain regions
    set_time_limit(120);

    $request->user()->sendEmailVerificationNotification();

    return response()->json(['message' => 'Link verifikasi baru sudah dikirim ke email kamu sayang! ❤️']);
})->name('verification.send');

// Social Login
Route::get('/auth/{provider}', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user/profile', [UserController::class, 'update']);
    Route::put('/user/change-password', [UserController::class, 'changePassword']);

    // Transactions
    Route::get('/transactions/summary', [TransactionController::class, 'summary']);
    Route::apiResource('transactions', TransactionController::class);

    // Assets
    Route::get('/wealth-history', [WealthHistoryController::class, 'index']);
    Route::apiResource('assets', AssetController::class);

    // Loans
    Route::apiResource('loans', LoanController::class);

    // Goals
    Route::apiResource('goals', GoalController::class);

    // AI & Services (The Gatekeeper)
    Route::get('/ai/insights', [AIController::class, 'getDashboardInsight'])->middleware('throttle:5,1');
    Route::post('/ai/analyze-receipt', [AIController::class, 'analyzeReceipt'])->middleware('throttle:10,1');
    Route::post('/media/upload', [MediaController::class, 'upload']);

    // Holidays
    Route::apiResource('holidays', HolidayController::class);
});
