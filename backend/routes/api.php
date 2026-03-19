<?php
/** Forced Redeploy: Social Auth Support 2026-03-19 **/

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WealthHistoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:3,1');
Route::post('/forgot-password', [\App\Http\Controllers\PasswordResetController::class, 'sendResetLinkEmail'])->middleware('throttle:3,1');
Route::post('/reset-password', [\App\Http\Controllers\PasswordResetController::class, 'reset'])->name('password.reset')->middleware('throttle:3,1');

// Email Verification
Route::get('/email/verify/{id}/{hash}', function (Request $request) {
    if (!$request->hasValidSignature()) {
        return response()->json(['message' => 'Link verifikasi sudah kadaluarsa sayang. 🥺'], 401);
    }

    $user = \App\Models\User::findOrFail($request->id);

    if (!$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new \Illuminate\Auth\Events\Verified($user));
    }

    return response()->json(['message' => 'Hore! Email kamu sudah terverifikasi sayang! ✨']);
})->name('verification.verify');

Route::middleware('auth:sanctum')->post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Link verifikasi baru sudah dikirim sayang! ❤️']);
})->name('verification.send');

// Social Login
Route::get('/auth/{provider}', [\App\Http\Controllers\SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [\App\Http\Controllers\SocialAuthController::class, 'handleProviderCallback']);

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
    Route::get('/ai/insights', [\App\Http\Controllers\AIController::class, 'getDashboardInsight'])->middleware('throttle:5,1');
    Route::post('/ai/analyze-receipt', [\App\Http\Controllers\AIController::class, 'analyzeReceipt'])->middleware('throttle:10,1');
    Route::post('/media/upload', [\App\Http\Controllers\MediaController::class, 'upload']);

    // Holidays
    Route::apiResource('holidays', HolidayController::class);
});
