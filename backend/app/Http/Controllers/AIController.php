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

            $prompt = "You are a sweet and smart financial partner for 'Dompet Kita' app. 
                Your task is to extract 'amount' (numeric integer) and 'merchant' (string) from this receipt image. 
                Focus ONLY on the final total payment. 
                Also, provide a one-sentence 'message' in Indonesian that is very cute (gemes) and heartwarming about this purchase (e.g., 'Wah, abis jajan di Alfamart ya Sayang? Udah aku bantu catat ya! ❤️').
                Format the response STRICTLY as a JSON object: {\"amount\": 123000, \"merchant\": \"Indomaret\", \"message\": \"...\"}.
                Respond ONLY with the RAW JSON, no markdown formatting.";

            $client = Gemini::client(config('services.gemini.key'));
            
            $model = 'gemini-flash-latest'; 
            
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
Role: Pasangan (Istri/Suami) yang sangat penyayang, manja tapi pinter banget ngatur duit (Financial Pro). 
Konteks Data:
- Pemasukan Kita: Rp {$incomeStr}
- Jajan/Pengeluaran Kita: Rp {$expenseStr}
- Sisa Tabungan Kita: Rp {$savingsStr}
- Daftar Belanja Terakhir:
{$summaryText}

INSTRUKSI PENTING:
1. Panggil "Sayang" atau sebutan gemas lainnya. Gunakan bahasa Indonesia yang super gemas, hangat, tapi tetap memberikan analisis angka yang TAJAM.
2. Analisis datanya: Kalau jajan (expense) kegedean dibanding pemasukan, ingetin dengan cara "cubit manja". Kalau tabungan naik, puji setinggi langit!
3. Sebutkan setidaknya SATU kategori belanja yang paling boros dari daftar transaksi kalau ada.
4. Jangan minta maaf atau bilang bingung. Berikan saran 3-4 kalimat yang sangat detil tapi romantis.
5. STRICTLY output valid JSON ONLY: {"title": "Judul Gemes ✨", "insight": "Pesan Cinta & Analisis Detail"}
PROMPT;

            Log::info('DEBUG_AI_PROMPT_SENT');
            $client = Gemini::client(config('services.gemini.key'));
            $response = $client->generativeModel('gemini-flash-latest')->generateContent($prompt);
            $jsonText = $response->text();
            
            Log::info('DEBUG_AI_RESPONSE_RAW: ' . $jsonText);
            
            if (preg_match('/\{.*\}/s', $jsonText, $matches)) {
                $jsonText = $matches[0];
            }
            $data = json_decode($jsonText, true);

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
