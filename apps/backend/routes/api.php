<?php

use App\Http\Controllers\AIController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\InsightController;
use App\Http\Controllers\LegacyController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ScheduledTransactionController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WealthHistoryController;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Spatie\Honeypot\ProtectAgainstSpam;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/verify-2fa', [AuthController::class, 'verify2fa'])->middleware('throttle:5,1');
Route::post('/register', [AuthController::class, 'register'])->middleware(['throttle:3,1', ProtectAgainstSpam::class]);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])->middleware(['throttle:3,1', ProtectAgainstSpam::class]);
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->name('password.reset')->middleware(['throttle:3,1', ProtectAgainstSpam::class]);

Route::middleware('auth:sanctum')->post('/sudo/confirm', [AuthController::class, 'sudoConfirm']);

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

        return response()->json(['message' => __('api.verification_invalid')], 401);
    }

    $user = User::findOrFail($request->id);

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new Verified($user));
    }

    return response()->json(['message' => __('api.verification_success')]);
})->name('verification.verify');

Route::middleware('auth:sanctum')->post('/email/verification-notification', function (Request $request) {
    if ($request->user()->hasVerifiedEmail()) {
        return response()->json(['message' => __('api.already_verified')]);
    }

    // Increase execution time as SMTP can be slow from certain regions
    set_time_limit(120);

    $request->user()->sendEmailVerificationNotification();

    return response()->json(['message' => __('api.notification_sent')]);
})->name('verification.send');

// Social Login
Route::get('/auth/{provider}', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

// Diagnostic Routes (Temporary)
Route::get('/test/ai-health', [\App\Http\Controllers\Test\AiHealthController::class, 'check']);

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user/profile', [UserController::class, 'update'])->middleware('sudo');
    Route::put('/user/change-password', [UserController::class, 'changePassword'])->middleware('sudo');

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

    // Scheduled Transactions (Phase 6)
    Route::apiResource('scheduled-transactions', ScheduledTransactionController::class);

    // AI & Services (The Gatekeeper)
    Route::get('/ai/insights', [AIController::class, 'getDashboardInsight'])->middleware('throttle:ai-insight');
    Route::get('/ai/guardian', [AIController::class, 'getGuardianStatus'])->middleware('throttle:ai-insight');
    Route::post('/ai/chat', [AIController::class, 'chat'])->middleware('throttle:ai-chat');
    Route::post('/ai/analyze-receipt', [AIController::class, 'analyzeReceipt'])->middleware('throttle:ai-scan');
    Route::get('/ai/wisdom', [AIController::class, 'getWisdom'])->middleware('throttle:ai-insight');
    Route::post('/ai/wisdom/generate', [AIController::class, 'generateWisdom'])->middleware('throttle:ai-insight');
    Route::get('/ai/wealth/simulate', [AIController::class, 'simulateWealth'])->middleware('throttle:ai-insight');
    Route::get('/ai/tax/estimate', [TaxController::class, 'getEstimate'])->middleware('throttle:ai-insight');
    Route::get('/ai/legacy/report', [LegacyController::class, 'getReport'])->middleware('throttle:ai-insight');
    Route::post('/ai/legacy/archive', [LegacyController::class, 'prepareArchive'])->middleware(['throttle:ai-insight', 'sudo']);
    // Quantum Insights (Phase 6)
    Route::get('/ai/quantum-insights', [InsightController::class, 'index']);
    Route::post('/ai/quantum-insights/generate', [InsightController::class, 'generate'])->middleware('throttle:ai-insight');
    Route::patch('/ai/quantum-insights/{insight}', [InsightController::class, 'update']);
    Route::delete('/ai/quantum-insights/{insight}', [InsightController::class, 'destroy']);

    Route::post('/media/upload', [MediaController::class, 'upload']);

    // Holidays
    Route::apiResource('holidays', HolidayController::class);
});
