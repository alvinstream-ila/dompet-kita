<?php

namespace App\Services;

use Gemini;
use Gemini\Data\Blob;
use Gemini\Enums\MimeType;
use Illuminate\Support\Facades\Log;

class AiService
{
    /**
     * Analyze a receipt using Gemini AI.
     */
    public function analyzeReceipt(string $base64Data, string $mimeType): array
    {
        $prompt = "You are a sweet and smart financial partner for 'Dompet Kita' app. 
            Your task is to extract 'amount' (numeric integer) and 'merchant' (string) from this receipt image. 
            Focus ONLY on the final total payment. 
            Also, provide a one-sentence 'message' in Indonesian that is very cute (gemes) and heartwarming about this purchase (e.g., 'Wah, abis jajan di Alfamart ya Sayang? Udah aku bantu catat ya! ❤️').
            Format the response STRICTLY as a JSON object: {\"amount\": 123000, \"merchant\": \"Indomaret\", \"message\": \"...\"}.
            Respond ONLY with the RAW JSON, no markdown formatting.";

        $client = Gemini::client(config('services.gemini.key'));
        
        $response = $client->generativeModel('gemini-flash-latest')
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

        return [
            'amount' => (int) $result['amount'],
            'merchant' => $result['merchant'] ?? 'Unknown Merchant',
            'message' => $result['message'] ?? 'AI Berhasil membaca struk! Nominal otomatis terisi ya Sayang! ❤️'
        ];
    }

    /**
     * Generate financial insight.
     */
    public function generateInsight(string $incomeStr, string $expenseStr, string $savingsStr, string $summaryText): array
    {
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

        $client = Gemini::client(config('services.gemini.key'));
        $response = $client->generativeModel('gemini-flash-latest')->generateContent($prompt);
        $jsonText = $response->text();
        
        if (preg_match('/\{.*\}/s', $jsonText, $matches)) {
            $jsonText = $matches[0];
        }
        $data = json_decode($jsonText, true);

        return [
            'title' => $data['title'] ?? 'Sayang Terharu ✨',
            'insight' => $data['insight'] ?? 'Something went wrong with AI response.'
        ];
    }
}
