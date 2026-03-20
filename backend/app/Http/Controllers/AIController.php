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
            
            // Try 1.5 Flash, fallback to 1.0 Pro if needed
            $model = 'gemini-1.5-flash'; 
            
            $response = $client->generativeModel($model)
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
            $cacheKey = "ai_insight_v2_user_{$user->id}";

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

                $incomeStr = number_format($totalIncome);
                $expenseStr = number_format($totalExpense);
                $savingsStr = number_format($savings);

                $prompt = <<<PROMPT
Role: Professional Financial Advisor who is also a LOVING and SWEET partner.
System: Dompet Kita App.
Data Stats:
Income: Rp {$incomeStr}
Expense: Rp {$expenseStr}
Savings: Rp {$savingsStr}
Transactions:
{$summaryText}

CRITICAL TASK: Give a 2-sentence financial insight. 
If data is EMPTY, say: "Sayangku, mari kita mulai petualangan hemat bareng! Satu langkah kecil hari ini adalah modal hunian impian kita besok. Yuk catat pengeluaran pertamamu! ❤️"
If data exists, analyze the biggest expense and encourage saving.

STRICT RULE: NEVER apologize. NEVER say you are confused or pusing. ALWAYS return the result in this JSON format:
{"title": "Dari Hati Sayang ✨", "insight": "MESSAGE_HERE"}
PROMPT;

                $client = Gemini::client(config('services.gemini.key'));
                $response = $client->generativeModel('gemini-pro')->generateContent($prompt);
                $jsonText = $response->text();
                
                // Extract JSON if AI adds markdown
                if (preg_match('/\{.*\}/s', $jsonText, $matches)) {
                    $jsonText = $matches[0];
                }
                
                $data = json_decode($jsonText, true);
                
                if (!$data || !isset($data['insight'])) {
                    throw new \Exception('Invalid dynamic AI response: ' . $jsonText);
                }

                return [
                    'title' => $data['title'] ?? 'Dari Hati Sayang ✨',
                    'insight' => $data['insight']
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
