<?php

namespace App\Http\Controllers;

use App\Actions\AI\AnalyzeReceiptAction;
use App\Actions\AI\Cognitive\GenerateWisdomAction;
use App\Actions\AI\Cognitive\GetLatestWisdomAction;
use App\Actions\AI\Cognitive\GetUnreadWisdomsAction;
use App\Actions\AI\Cognitive\ProcessChatAction;
use App\Actions\AI\GenerateInsightAction;
use App\Actions\Finance\Wealth\SimulateMonteCarloAction;
use App\Enums\TransactionType;
use App\Http\Requests\AI\AnalyzeReceiptRequest;
use App\Models\Transaction;
use App\Models\User;
use App\Services\FinancialIntelligenceService;
use App\Services\StorageService;
use App\Traits\HasApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Class AIController
 * Modern orchestrator for Gemini-powered financial cognitive functions.
 */
class AIController extends Controller
{
    use HasApiResponses;

    public function __construct(
        protected AnalyzeReceiptAction $analyzeReceiptAction,
        protected GenerateInsightAction $generateInsightAction,
        protected FinancialIntelligenceService $intelService,
        protected ProcessChatAction $processChatAction,
        protected GenerateWisdomAction $generateWisdomAction,
        protected GetLatestWisdomAction $getLatestWisdomAction,
        protected GetUnreadWisdomsAction $getUnreadWisdomsAction,
        protected SimulateMonteCarloAction $simulateMonteCarloAction,
        protected StorageService $storageService
    ) {}

    /**
     * Analyze receipt from image using Gemini AI.
     */
    public function analyzeReceipt(AnalyzeReceiptRequest $request): JsonResponse
    {
        try {
            if ($request->filled('image')) {
                $base64Data = (string) $request->string('image');
                $mimeType = (string) $request->string('mime_type', 'image/jpeg');
            } else {
                [$base64Data, $mimeType] = $this->storageService->getFileDataFromRequest($request);
            }

            $result = $this->analyzeReceiptAction->execute($base64Data, $mimeType);

            /** @var array{amount?: mixed, merchant?: mixed, category?: mixed, message?: mixed} $result */
            return $this->success([
                'amount' => (int) ($result['amount'] ?? 0),
                'merchant' => (string) ($result['merchant'] ?? 'Unknown'),
                'category' => (string) ($result['category'] ?? 'Other'),
                'message' => (string) ($result['message'] ?? ''),
            ], 'Struk berhasil diproses! ✨');

        } catch (\Throwable $e) {
            Log::error('AI_RECEIPT_SCAN_ERROR: '.$e->getMessage());

            return $this->error('Gagal memproses struk: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get financial insights based on user transactions.
     */
    public function getDashboardInsight(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            return $this->error('Unauthorized', 401);
        }

        try {
            $transactions = Transaction::where('user_id', $user->id)
                ->where('date', '>=', now()->subDays(90))
                ->orderBy('date', 'desc')
                ->get();

            if ($transactions->isEmpty()) {
                return $this->success([
                    'title' => 'Sayang AI ✨',
                    'insight' => 'Waktunya mulai petualangan baru kita, Sayang! Yuk, mulai catat pengeluaran pertama kita biar impian kita makin dekat? ❤️',
                ]);
            }

            $totalIncome = (float) $transactions->filter(fn ($t) => $t->type === TransactionType::INCOME)->sum('amount');
            $totalExpense = (float) $transactions->filter(fn ($t) => $t->type === TransactionType::EXPENSE)->sum('amount');
            $savings = (float) ($totalIncome - $totalExpense);

            $summaryText = $transactions->take(20)->map(function ($t) {
                /** @var Transaction $t */
                $typeStr = $t->type->value;

                return "{$t->date}: {$typeStr} Rp ".number_format((float) $t->amount)." ({$t->category})";
            })->implode("\n");

            $cacheKey = "ai_insight_{$user->id}";

            $data = Cache::remember($cacheKey, 3600 * 4, function () use ($totalIncome, $totalExpense, $savings, $summaryText) {
                return $this->generateInsightAction->execute(
                    (string) number_format((float) $totalIncome),
                    (string) number_format((float) $totalExpense),
                    (string) number_format((float) $savings),
                    $summaryText
                );
            });

            return $this->success([
                'title' => $data['title'],
                'insight' => $data['insight'],
            ]);

        } catch (\Throwable $e) {
            Log::error('AI_DASHBOARD_INSIGHT_ERROR: '.$e->getMessage());

            return $this->success([
                'title' => 'Sayang Lagi Fokus ✨',
                'insight' => 'Aku lagi cek catatannya sebentar ya sayang. Nanti aku kabarin lagi update keuangannya. ❤️',
            ]);
        }
    }

    /**
     * Chat with the AI about financial context (Cognitive Chat Genius).
     */
    public function check(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }

    public function chat(Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:1000']);
        $user = $request->user();
        if (! $user instanceof User) {
            return $this->error('Unauthorized', 401);
        }

        try {
            $response = $this->processChatAction->execute($user, (string) $request->string('message'));

            return $this->success($response, 'Asisten AI menjawab pesanmu! 💬');
        } catch (\Throwable $e) {
            Log::error('AI_CHAT_GENIUS_ERROR: '.$e->getMessage());

            return $this->error('Maaf sayang, asisten lagi istirahat bentar ya.. 🙏❤️', 500);
        }
    }

    /**
     * Get AI Guardian predictive status and rebalance advice.
     */
    public function getGuardianStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            return $this->error('Unauthorized', 401);
        }

        try {
            $prediction = $this->intelService->predictLiquidityCrisis($user);
            $rebalance = $this->intelService->generateRebalanceAdvice($user);

            return $this->success([
                'prediction' => $prediction,
                'rebalance' => $rebalance,
            ], 'Guardian AI status updated.');
        } catch (\Throwable $e) {
            Log::error('AI_GUARDIAN_CONTROLLER_ERROR: '.$e->getMessage());

            return $this->error('Gagal mengambil status Guardian.', 500);
        }
    }

    /**
     * Get latest proactive AI wisdom for the user.
     */
    public function getWisdom(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (! $user instanceof User) {
                return $this->error('Unauthorized', 401);
            }

            $wisdom = $this->getLatestWisdomAction->execute($user);
            $unread = $this->getUnreadWisdomsAction->execute($user);

            return $this->success([
                'latest' => $wisdom,
                'unread_count' => $unread->count(),
            ], 'Wisdom berhasil diambil! ✨');
        } catch (\Exception $e) {
            Log::error('AI_WISDOM_ERROR: '.$e->getMessage());

            return $this->error('Gagal mengambil wisdom.', 500);
        }
    }

    /**
     * Generate a new proactive wisdom insight.
     */
    public function generateWisdom(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            return $this->error('Unauthorized', 401);
        }

        try {
            $wisdom = $this->generateWisdomAction->execute($user);

            return $this->success($wisdom, 'Wisdom baru telah dibuat untukmu! 🧠');
        } catch (\Exception $e) {
            Log::error('AI_WISDOM_GENERATE_ERROR: '.$e->getMessage());

            return $this->error('Gagal generate wisdom.', 500);
        }
    }

    /**
     * Get Monte Carlo Wealth Projection.
     */
    public function simulateWealth(Request $request): JsonResponse
    {
        $months = $request->integer('months', 12);
        $user = $request->user();
        if (! $user instanceof User) {
            return $this->error('Unauthorized', 401);
        }

        try {
            $trajectories = $this->simulateMonteCarloAction->execute($user, $months);

            return $this->success($trajectories, "Monte Carlo 100-iteration wealth pulse for $months months.");
        } catch (\Exception $e) {
            Log::error('AI_WEALTH_SIMULATION_ERROR: '.$e->getMessage());

            return $this->error('Gagal melakukan simulasi proyeksi kekayaan.', 500);
        }
    }
}
