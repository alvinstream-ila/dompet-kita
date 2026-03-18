<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Gemini;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;
use Illuminate\Support\Facades\Cache;

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
            'image' => 'required|string', // Base64 expected
            'mime_type' => 'required|string',
        ]);

        try {
            $apiKey = config('services.gemini.key');
            
            if (!$apiKey) {
                return response()->json([
                    'message' => 'AI Service not configured'
                ], 500);
            }

            $client = Gemini::client($apiKey);
            
            $prompt = "Analyze this receipt and extract: 1. Total Amount (number only), 2. Shop/Merchant Name. Respond strictly in JSON format: { \"amount\": number, \"merchant\": \"string\" }";

            $result = $client->generativeModel(model: 'gemini-1.5-flash')->generateContent([
                $prompt,
                new \Gemini\Data\Blob(
                    mimeType: $request->mime_type,
                    data: $request->image
                )
            ]);

            $text = $result->text();
            $cleanText = preg_replace('/```json|```/i', '', $text);
            $cleanText = trim($cleanText);
            
            $data = json_decode($cleanText, true);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('AI Scan Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menganalisis struk: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get financial insights based on user transactions.
     */
    public function getDashboardInsight(Request $request)
    {
        $user = $request->user();
        $cacheKey = "ai_insight_{$user->id}";

        // Cache for 6 hours to save API usage
        return Cache::remember($cacheKey, 60 * 6, function () use ($user) {
            try {
                $apiKey = config('services.gemini.key');
                if (!$apiKey) return response()->json(['message' => 'AI Service not configured'], 500);

                // Aggregate last 30 days data
                $transactions = Transaction::where('user_id', $user->id)
                    ->where('date', '>=', now()->subDays(30))
                    ->get();

                $totalIncome = $transactions->where('type', 'income')->sum('amount');
                $totalExpense = $transactions->where('type', 'expense')->sum('amount');
                $categorySummary = $transactions->where('type', 'expense')
                    ->groupBy('category')
                    ->map(fn($items) => $items->sum('amount'));

                $client = \Gemini::client($apiKey);
                
                $prompt = "Kamu adalah asisten keuangan pribadi yang sangat perhatian dan hangat untuk pasangan Alvin & Ila. 
                Data Keuangan 30 Hari Terakhir:
                - Nama: {$user->name}
                - Total Pemasukan: Rp " . number_format($totalIncome, 0, ',', '.') . "
                - Total Pengeluaran: Rp " . number_format($totalExpense, 0, ',', '.') . "
                - Breakdown Kategori: " . $categorySummary->toJson() . "
                
                Berikan 1 paragraf (maks 3 kalimat) insight yang sangat personal, romantis, dan memberikan semangat/saran membangun. 
                Gunakan nada bicara seorang istri/suami yang sayang. Fokus pada masa depan bersama.
                Output harus berupa JSON: { \"title\": \"string judul ceria\", \"insight\": \"string paragraf insight\" }";

                $result = $client->generativeModel(model: 'gemini-1.5-flash')->generateContent($prompt);

                $text = $result->text();
                $cleanText = preg_replace('/```json|```/i', '', $text);
                $cleanText = trim($cleanText);
                
                return json_decode($cleanText, true);

            } catch (\Exception $e) {
                Log::error('AI Insight Error: ' . $e->getMessage());
                return [
                    'title' => 'Duh Sayang, Maaf Ya.. 🥺',
                    'insight' => 'Aku lagi agak pusing hitung-hitungannya. Tapi intinya, aku sayang kamu dan kita pasti bisa atur uang bareng-bareng! Semangat!'
                ];
            }
        });
    }
}
