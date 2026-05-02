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
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ScheduledTransactionController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\Test\AiHealthController;
use App\Http\Controllers\Test\AiMaintenanceController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WealthHistoryController;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Spatie\Honeypot\ProtectAgainstSpam;

// ─── Internal Guard (Firewall v7.1.18) ───────────────────────────────────────
// All routes wrapped in firewall.all for SQLi, XSS, LFI, RFI, PHP & Bot protection
Route::middleware('firewall.all')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login'])->middleware(['throttle:auth', ProtectAgainstSpam::class]);
    Route::post('/verify-2fa', [AuthController::class, 'verify2fa'])->middleware('throttle:auth');
    Route::post('/register', [AuthController::class, 'register'])->middleware(['throttle:registration', ProtectAgainstSpam::class]);
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])->middleware(['throttle:password-reset', ProtectAgainstSpam::class]);
    Route::post('/reset-password', [PasswordResetController::class, 'reset'])->name('password.reset')->middleware(['throttle:password-reset', ProtectAgainstSpam::class]);

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

    Route::middleware('auth:sanctum')->post('/email/verify-code', [AuthController::class, 'verifyEmailCode']);

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

    // Diagnostic Routes (Protected)
    Route::middleware(['auth:sanctum', 'sudo'])->group(function (): void {
        Route::get('/test/ai-health', [AiHealthController::class, 'check']);
        Route::get('/test/ai-reset', [AiMaintenanceController::class, 'reset']);
    });

    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', fn (Request $request) => $request->user());
        Route::put('/user/profile', [UserController::class, 'update'])->middleware('sudo');
        Route::put('/user/change-password', [UserController::class, 'changePassword'])->middleware('sudo');

        // Transactions
        Route::get('/transactions/summary', [TransactionController::class, 'summary']);
        Route::get('/transactions/report/pdf', [TransactionController::class, 'exportPdf']);
        Route::get('/transactions/report/data', [TransactionController::class, 'reportData']);
        Route::apiResource('transactions', TransactionController::class);

        // Assets
        Route::get('/wealth-history', [WealthHistoryController::class, 'index']);
        // Wealth & Asset Management
        Route::post('/assets/{asset}/fund', [AssetController::class, 'fund']);
        Route::post('/assets/{asset}/withdraw', [AssetController::class, 'withdraw']);
        Route::get('/assets/{asset}/history', [AssetController::class, 'history']);
        Route::apiResource('assets', AssetController::class);

        // Loans
        Route::get('loans/report', [LoanController::class, 'report']);
        Route::apiResource('loans', LoanController::class);

        // Goals
        Route::post('goals/{goal}/deposit', [GoalController::class, 'deposit']);
        Route::get('goals/{goal}/history', [GoalController::class, 'history']);
        Route::apiResource('goals', GoalController::class);

        // Scheduled Transactions (Phase 6)
        Route::post('scheduled-transactions/{scheduledTransaction}/execute', [ScheduledTransactionController::class, 'execute']);
        Route::apiResource('scheduled-transactions', ScheduledTransactionController::class);

        // AI & Services (The Gatekeeper)
        Route::get('/ai/insights', [AIController::class, 'getDashboardInsight'])->middleware('throttle:ai-insight');
        Route::get('/ai/guardian', [AIController::class, 'getGuardianStatus'])->middleware('throttle:ai-insight');
        Route::post('/ai/chat', [AIController::class, 'chat'])->middleware('throttle:ai-chat');
        Route::post('/ai/chat/clear', [AIController::class, 'clearChat']);
        Route::post('/ai/analyze-receipt', [AIController::class, 'analyzeReceipt'])->middleware('throttle:ai-scan');
        Route::get('/ai/wisdom', [AIController::class, 'getWisdom'])->middleware('throttle:ai-insight');
        Route::post('/ai/wisdom/generate', [AIController::class, 'generateWisdom'])->middleware('throttle:ai-insight');
        Route::get('/ai/wealth/simulate', [AIController::class, 'simulateWealth'])->middleware('throttle:ai-insight');
        Route::get('/ai/tax/estimate', [TaxController::class, 'getEstimate'])->middleware('throttle:ai-insight');
        // Digital Legacy Vault
        Route::get('/legacy', [LegacyController::class, 'index']);
        Route::patch('/legacy/settings', [LegacyController::class, 'updateSettings'])->middleware('sudo');
        Route::post('/legacy/heartbeat', [LegacyController::class, 'heartbeat']);
        Route::post('/legacy/snapshot', [LegacyController::class, 'triggerSnapshot'])->middleware('sudo');
        Route::get('/legacy/download/{id}', [LegacyController::class, 'download'])->middleware('sudo');
        Route::get('/ai/legacy/report', [LegacyController::class, 'generateStream'])->middleware('sudo');

        // Quantum Insights (Phase 6)
        Route::get('/ai/quantum-insights', [InsightController::class, 'index']);
        Route::post('/ai/quantum-insights/generate', [InsightController::class, 'generate'])->middleware('throttle:ai-insight');
        Route::patch('/ai/quantum-insights/{insight}', [InsightController::class, 'update']);
        Route::delete('/ai/quantum-insights/{insight}', [InsightController::class, 'destroy']);

        Route::post('/media/upload', [MediaController::class, 'upload'])->middleware('throttle:media-upload');
        Route::get('/media/serve', [MediaController::class, 'serve'])->name('media.serve')->middleware('signed');

        // Partner Sync (Family Hub)
        Route::post('/partner/invite', [PartnerController::class, 'invite'])->middleware(['sudo', 'throttle:invitation']);
        Route::get('/partner/invitation/{token}', [PartnerController::class, 'getInvitation']);
        Route::post('/partner/accept', [PartnerController::class, 'accept'])->middleware('sudo');
        Route::post('/partner/unlink', [PartnerController::class, 'unlink'])->middleware('sudo');

        // Holidays
        Route::apiResource('holidays', HolidayController::class);
        Route::post('holidays/{holiday}/fund', [HolidayController::class, 'fund']);
        Route::get('holidays/{holiday}/history', [HolidayController::class, 'history']);
    });
}); // END: firewall.all
