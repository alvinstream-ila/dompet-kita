<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AIController extends Controller
{
    protected AiService $aiService;

    private const IMAGE_JPEG = 'image/jpeg';

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Analyze receipt from image using Gemini AI.
     *
     * @return JsonResponse
     */
    public function analyzeReceipt(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'nullable|string|max:15000000', // ~10-11MB Base64 limit
            'mime_type' => 'nullable|string|max:100',
            'receipt_url' => 'nullable|url',
        ]);

        try {
            if ($request->filled('receipt_url') || $request->filled('receipt_path')) {
                [$base64Data, $mimeType] = $this->getFileDataFromUrlOrPath($request);
            } elseif ($request->filled('image')) {
                $base64Data = $request->image;
                $mimeType = $request->mime_type ?? self::IMAGE_JPEG;
            } else {
                throw new \Exception('Data gambar tidak valid.');
            }

            $result = $this->aiService->analyzeReceipt($base64Data, $mimeType);

            return response()->json([
                'success' => true,
                'data' => [
                    'amount' => (int) $result['amount'],
                    'merchant' => $result['merchant'] ?? 'Unknown Merchant',
                    'message' => $result['message'] ?? 'AI Berhasil membaca struk! Nominal otomatis terisi ya Sayang! ❤️',
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('AI_RECEIPT_SCAN_ERROR: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Detail Error: '.$e->getMessage(),
            ], 500);
        }
    }

    private function getFileDataFromUrlOrPath(Request $request): array
    {
        $filePath = $request->receipt_path;

        // Fallback extract path if only receipt_url given
        if (! $filePath && str_contains($request->receipt_url, 'gateway.storjshare.io')) {
            $bucket = \config('filesystems.disks.storj.bucket');
            $filePath = str_replace("https://gateway.storjshare.io/{$bucket}/", '', $request->receipt_url);
        }

        if ($filePath) {
            $disk = \config('filesystems.default', 'public');
            // Workaround to ensure correct config reading if missing
            if ($disk === 'storj' && ! \config('filesystems.disks.storj')) {
                $disk = 's3';
            }
            $fileContents = Storage::disk($disk)->get($filePath);
            if (! $fileContents) {
                throw new \Exception('Gagal membaca file dari internal storage path: '.$filePath);
            }
        } else {
            $response = Http::get($request->receipt_url);
            if (! $response->successful()) {
                throw new \Exception('Gagal membaca file dari storage eksternal.');
            }
            $fileContents = $response->body();
        }

        $base64Data = base64_encode($fileContents);
        $ext = strtolower(pathinfo($filePath ? parse_url($filePath, PHP_URL_PATH) : parse_url($request->receipt_url, PHP_URL_PATH), PATHINFO_EXTENSION));

        $mimeType = match ($ext) {
            'png' => 'image/png',
            'webp' => 'image/webp',
            'heic' => 'image/heic',
            'heif' => 'image/heif',
            default => self::IMAGE_JPEG
        };

        return [$base64Data, $mimeType];
    }

    /**
     * Get financial insights based on user transactions.
     */
    public function getDashboardInsight(Request $request): JsonResponse
    {
        $user = $request->user();
        Log::info('DEBUG_AI_START: '.$user->email);

        try {
            $count = Transaction::where('user_id', $user->id)->count();
            if ($count === 0) {
                return response()->json([
                    'title' => 'Sayang AI ✨',
                    'insight' => 'Waktunya mulai petualangan baru kita, Sayang! Yuk, mulai catat pengeluaran pertama kita biar impian kita makin dekat? ❤️',
                ]);
            }

            $transactions = Transaction::where('user_id', $user->id)
                ->where('date', '>=', now()->subDays(30))
                ->orderBy('date', 'desc')
                ->get();

            $totalIncome = $transactions->filter(fn ($t) => $t->type === TransactionType::INCOME)->sum('amount');
            $totalExpense = $transactions->filter(fn ($t) => $t->type === TransactionType::EXPENSE)->sum('amount');
            $savings = (float) $totalIncome - (float) $totalExpense;
            $summaryText = $transactions->map(fn ($t) => "{$t->date}: ".($t->type instanceof TransactionType ? $t->type->value : $t->type).' Rp '.number_format($t->amount)." ({$t->category})")->implode("\n");

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
                'insight' => $data['insight'] ?? 'Something went wrong with AI response.',
            ]);

        } catch (\Exception $e) {
            Log::error('DEBUG_AI_CRITICAL_ERROR: '.$e->getMessage());

            return response()->json([
                'title' => 'Sayang Lagi Fokus ✨',
                'insight' => 'Aku lagi cek catatannya sebentar ya sayang. Nanti aku kabarin lagi update keuangannya. Tetap semangat! ❤️ (CODE_V3)',
            ]);
        }
    }
}
