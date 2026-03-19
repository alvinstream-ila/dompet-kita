<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;
use Illuminate\Support\Facades\Cache;
use Gemini;
use Gemini\Data\Blob;
use Gemini\Enums\MimeType;
use Gemini\Enums\ModelType;

class AIController extends Controller
{
    /**
     * Analyze receipt from image using Gemini AI.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function analyzeReceipt(Request $request)
    {
        $request->validate([
            'image' => 'required|string', // Base64 encoded string
            'mime_type' => 'required|string'
        ]);

        try {
            $base64Data = $request->image;
            $mimeType = $request->mime_type;

            $prompt = "You are a financial receipt analyzer assistant for 'Dompet Kita' app. 
                Focus on extracting the 'amount' (numeric integer) and 'merchant' (string) from this receipt image.
                Identify precisely the total payment amount.
                Format the response STRICTLY as a JSON object: {\"amount\": 123000, \"merchant\": \"Indomaret\"}.
                If some values are unclear, make an educated guess. If impossible, return 0 for amount and 'Unknown' for merchant.
                Respond ONLY with the RAW JSON, no markdown formatting.";

            $client = Gemini::client(config('services.gemini.key'));
            
            $response = $client->generativeModel(ModelType::GEMINI_FLASH)
                ->generateContent([
                    $prompt,
                    new Blob(
                        mimeType: MimeType::from($mimeType),
                        data: $base64Data
                    )
                ]);

            $jsonText = $response->text();
            
            // Basic cleanup in case Gemini returns markdown
            $jsonText = preg_replace('/^```json\s*|```$/m', '', $jsonText);
            
            $result = json_decode($jsonText, true);

            if (!$result || !isset($result['amount'])) {
                throw new \Exception('Invalid JSON response from AI: ' . $jsonText);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'amount' => (int) $result['amount'],
                    'merchant' => $result['merchant'] ?? 'Unknown Merchant'
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
        try {
            $user = $request->user();
            $cacheKey = "ai_insight_user_{$user->id}";

            // Cache for 6 hours to save API costs
            return Cache::remember($cacheKey, now()->addHours(6), function () use ($user) {
                // Aggregate last 30 days data
                $transactions = Transaction::where('user_id', $user->id)
                    ->where('date', '>=', now()->subDays(30))
                    ->orderBy('date', 'desc')
                    ->limit(50) // Send recent history for context
                    ->get();

                $totalIncome = $transactions->where('type', 'income')->sum('amount');
                $totalExpense = $transactions->where('type', 'expense')->sum('amount');
                $savings = (float) $totalIncome - (float) $totalExpense;

                // Create transaction summary for AI
                $summaryText = $transactions->map(function($t) {
                    return "{$t->date}: {$t->type} Rp " . number_format($t->amount) . " ({$t->category} - {$t->description})";
                })->implode("\n");

                $prompt = "You are 'Sayang AI' for 'Dompet Kita' app. 
                    Based on these transactions from the last 30 days:
                    Total Income: Rp " . number_format($totalIncome) . "
                    Total Expense: Rp " . number_format($totalExpense) . "
                    Savings: Rp " . number_format($savings) . "
                    
                    Recent Detailed Transactions:
                    {$summaryText}
                    
                    TASK: Generate a SHORT financial insight (max 2-3 sentences) for the user.
                    The tone must be VERY SWEET, SUPPORTIVE, and like a loving partner (using 'Cintaku', 'Sayang', 'Kita' when referring to family budget).
                    If they save money, praise them. If they spend too much, encourage them gently to save more for 'Rumah Impian'.
                    
                    Format the response STRICTLY as a JSON object: 
                    {\"title\": \"Title Here\", \"insight\": \"Insight message here\"}.";

                $client = Gemini::client(config('services.gemini.key'));
                $response = $client->generativeModel(ModelType::GEMINI_FLASH)
                    ->generateContent($prompt);

                $jsonText = $response->text();
                $jsonText = preg_replace('/^```json\s*|```$/m', '', $jsonText);
                $result = json_decode($jsonText, true);

                if (!$result || !isset($result['insight'])) {
                    throw new \Exception('Invalid dynamic insight AI response');
                }

                return [
                    'title' => $result['title'] ?? 'Pesan Sayang ✨',
                    'insight' => $result['insight']
                ];
            });

        } catch (\Exception $e) {
            Log::error('AI_DYNAMIC_INSIGHT_ERROR: ' . $e->getMessage());
            return response()->json([
                'title' => 'Pesan Sayang ✨',
                'insight' => 'Apapun yang terjadi, aku selalu bangga sama kamu. Yuk semangat cari cuan bareng lagi ya Sayang! ❤️'
            ]);
        }
    }
}
