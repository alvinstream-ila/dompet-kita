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
        $user = $request->user();
        
        // No Transactions?
        $count = \App\Models\Transaction::where('user_id', $user->id)->count();
        if ($count === 0) {
            return response()->json([
                'title' => 'Sayang AI ✨',
                'insight' => 'Waktunya mulai petualangan baru kita, Sayang! Yuk, mulai catat pengeluaran pertama kita biar impian kita makin dekat? ❤️'
            ]);
        }

        $transactions = \App\Models\Transaction::where('user_id', $user->id)
            ->where('date', '>=', now()->subDays(30))
            ->orderBy('date', 'desc')
            ->get();

        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpense = $transactions->where('type', 'expense')->sum('amount');
        $savings = (float) $totalIncome - (float) $totalExpense;
        $summaryText = $transactions->map(fn($t) => "{$t->date}: {$t->type} Rp " . number_format($t->amount) . " ({$t->category})")->implode("\n");

        $incomeStr = number_format($totalIncome);
        $expenseStr = number_format($totalExpense);
        $savingsStr = number_format($savings);

        $prompt = <<<PROMPT
Role: Sweet loving partner and financial pro.
Budget: Income Rp {$incomeStr}, Expense Rp {$expenseStr}.
Transactions:
{$summaryText}

CRITICAL: Give a 2-sentence sweet insight in Indonesian. 
STRICT JSON: {"title": "REKOR DUNIA ✨", "insight": "MESSAGE"}
PROMPT;

        $client = Gemini::client(config('services.gemini.key'));
        $response = $client->generativeModel('gemini-pro')->generateContent($prompt);
        $data = json_decode($response->text(), true);

        return response()->json([
            'title' => $data['title'] ?? 'REKOR DUNIA ✨',
            'insight' => $data['insight'] ?? 'Something went wrong.'
        ]);
    }
}
