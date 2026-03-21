<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;
use App\Enums\TransactionType;
use Illuminate\Support\Facades\Cache;
use App\Services\AiService;

class AIController extends Controller
{
    protected AiService $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }
    /**
     * Analyze receipt from image using Gemini AI.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function analyzeReceipt(Request $request)
    {
        $request->validate([
            'image' => 'required|string|max:15000000', // ~10-11MB Base64 limit
            'mime_type' => 'required|string|max:100'
        ]);

        try {
            $base64Data = $request->image;
            $mimeType = $request->mime_type;

            $result = $this->aiService->analyzeReceipt($base64Data, $mimeType);

            return response()->json([
                'success' => true,
                'data' => [
                    'amount' => (int) $result['amount'],
                    'merchant' => $result['merchant'] ?? 'Unknown Merchant',
                    'message' => $result['message'] ?? 'AI Berhasil membaca struk! Nominal otomatis terisi ya Sayang! ❤️'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('AI_RECEIPT_SCAN_ERROR: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal menganalisis struk sayang. Coba lagi atau input manual ya! ❤️'
            ], 500);
        }
    }

    /**
     * Get financial insights based on user transactions.
     */
    public function getDashboardInsight(Request $request)
    {
        $user = $request->user();
        Log::info('DEBUG_AI_START: ' . $user->email);
        
        try {
            $count = Transaction::where('user_id', $user->id)->count();
            if ($count === 0) {
                return response()->json([
                    'title' => 'Sayang AI ✨',
                    'insight' => 'Waktunya mulai petualangan baru kita, Sayang! Yuk, mulai catat pengeluaran pertama kita biar impian kita makin dekat? ❤️'
                ]);
            }

            $transactions = Transaction::where('user_id', $user->id)
                ->where('date', '>=', now()->subDays(30))
                ->orderBy('date', 'desc')
                ->get();

            $totalIncome = $transactions->filter(fn($t) => $t->type === TransactionType::INCOME || $t->type === TransactionType::INCOME->value)->sum('amount');
            $totalExpense = $transactions->filter(fn($t) => $t->type === TransactionType::EXPENSE || $t->type === TransactionType::EXPENSE->value)->sum('amount');
            $savings = (float) $totalIncome - (float) $totalExpense;
            $summaryText = $transactions->map(fn($t) => "{$t->date}: " . ($t->type instanceof TransactionType ? $t->type->value : $t->type) . " Rp " . number_format($t->amount) . " ({$t->category})")->implode("\n");

            $incomeStr = number_format($totalIncome);
            $expenseStr = number_format($totalExpense);
            $savingsStr = number_format($savings);

            $cacheKey = "ai_insight_{$user->id}";
            
            $data = Cache::remember($cacheKey, 60 * 60 * 4, function () use ($incomeStr, $expenseStr, $savingsStr, $summaryText) {
                Log::info('DEBUG_AI_PROMPT_SENT_VIA_SERVICE');
                return $this->aiService->generateInsight($incomeStr, $expenseStr, $savingsStr, $summaryText);
            });

            return response()->json([
                'title' => $data['title'] ?? 'Sayang Terharu ✨',
                'insight' => $data['insight'] ?? 'Something went wrong with AI response.'
            ]);

        } catch (\Exception $e) {
            Log::error('DEBUG_AI_CRITICAL_ERROR: ' . $e->getMessage());
            return response()->json([
                'title' => 'Sayang Lagi Fokus ✨',
                'insight' => 'Aku lagi cek catatannya sebentar ya sayang. Nanti aku kabarin lagi update keuangannya. Tetap semangat! ❤️ (CODE_V3)'
            ]);
        }
    }
}
