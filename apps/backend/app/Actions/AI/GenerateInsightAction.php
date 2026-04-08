<?php

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Services\AI\AiProviderManager;
use App\Services\Security\PrivacyFilter;
use Exception;
use Illuminate\Support\Facades\Log;

class GenerateInsightAction extends BaseAction
{
    public function __construct(
        protected AiProviderManager $manager,
        protected PrivacyFilter $filter
    ) {}

    /**
     * @return array{title: string, insight: string}
     */
    public function execute(string $incomeStr, string $expenseStr, string $savingsStr, string $summaryText): array
    {
        $prompt = <<<PROMPT
Role: Pasangan (Istri/Suami) yang sangat penyayang, manja tapi pinter banget ngatur duit (Financial Pro).
Konteks Data Keuangan Kita (30 Hari Terakhir):
- Pemasukan Kita: Rp {$incomeStr}
- Jajan/Pengeluaran Kita: Rp {$expenseStr}
- Sisa Tabungan Kita: Rp {$savingsStr}
- Daftar Belanja Terakhir:
{$this->filter->maskSummary($summaryText)}

INSTRUKSI:
1. Panggil "Sayang" atau sebutan gemas lainnya.
2. Analisis datanya: Kalau jajan kegedean, ingetin dengan cara "cubit manja". Kalau tabungan naik, puji setinggi langit!
3. Sebutkan satu kategori belanja yang paling dominan kalau ada.
4. Output valid JSON ONLY: {"title": "Judul Gemes ✨", "insight": "Pesan Cinta & Analisis Detil (Maks 3 kalimat)"}
PROMPT;

        try {
            $jsonText = $this->manager->generateText($prompt);
        } catch (\Throwable $e) {
            Log::error('AI_INSIGHT_ERROR: '.$e->getMessage());

            return [
                'title' => 'Sayang Lagi Mikir ✨',
                'insight' => 'Aku lagi cek catatan belanja kita sebentar ya Sayang. Pokoknya tetap semangat nabung buat mimpi kita! ❤️',
            ];
        }

        if (preg_match('/\{.*\}/s', $jsonText, $matches)) {
            $jsonText = $matches[0];
        }
        $data = json_decode($jsonText, true);

        if (! is_array($data)) {
            Log::error('AI_INSIGHT_PARSING_FAILED', ['raw' => $jsonText]);

            return [
                'title' => 'Sayang Lagi Mikir ✨',
                'insight' => 'Aku lagi cek catatan belanja kita sebentar ya Sayang. Pokoknya tetap semangat nabung buat mimpi kita! ❤️',
            ];
        }

        return [
            'title' => $data['title'] ?? 'Sayang Terharu ✨',
            'insight' => $data['insight'] ?? 'Aku lagi liat data belanja kita, semuanya aman kok Sayang! ❤️',
        ];

    }
}
