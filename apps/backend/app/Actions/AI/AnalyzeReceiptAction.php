<?php

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Services\AI\AiProviderManager;
use App\Services\Security\PrivacyFilter;
use Exception;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class AnalyzeReceiptAction extends BaseAction
{
    public function __construct(
        protected AiProviderManager $manager,
        protected PrivacyFilter $filter
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function execute(string $base64Data, string $mimeType): array
    {
        $prompt = "You are a sweet and smart financial partner for 'Dompet Kita' app.
            Your task is to extract 'amount', 'merchant', and 'category' from this receipt image.
            
            1. 'amount': The final total payment. Extract only numbers. (e.g., 150000)
            2. 'merchant': The store name. (e.g., 'Starbucks', 'Alfamart')
            3. 'category': Choose the most relevant from: 'Makanan & Minuman', 'Belanja', 'Transportasi', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Tagihan & Utilitas', 'Kebutuhan Rumah', 'Lainnya'.
            4. 'message': A one-sentence heartwarming Indonesian message about this purchase.
            
            Format the response STRICTLY as a JSON object: {\"amount\": 150000, \"merchant\": \"...\", \"category\": \"...\", \"message\": \"...\"}.
            Respond ONLY with the RAW JSON.";

        try {
            $jsonText = $this->manager->generateFromImage($prompt, $base64Data, $mimeType);
        } catch (Exception $e) {
            $msg = $e->getMessage();
            Log::error('AI_SCAN_ERROR (Receipt Scan): '.$msg);
            throw new RuntimeException('Maaf Sayang, AI lagi kecapekan: '.$msg);
        }

        if (preg_match('/\{.*\}/s', $jsonText, $matches)) {
            $jsonText = $matches[0];
        }

        $result = json_decode(trim($jsonText), true);

        if (! $result) {
            Log::error('AI_SCAN_PARSING_FAILED', ['raw' => $jsonText]);
            throw new RuntimeException('Maaf Sayang, AI gagal memproses data struk ini. Coba ketik manual ya! ❤️');
        }

        $rawAmount = $result['amount'] ?? 0;
        $cleanAmount = (int) preg_replace('/[^0-9]/', '', (string) $rawAmount);

        return [
            'amount' => $cleanAmount,
            'merchant' => $result['merchant'] ?? 'Toko Tidak Terbaca',
            'category' => $result['category'] ?? 'Belanja',
            'message' => $result['message'] ?? 'AI Berhasil membaca struk! Nominal otomatis terisi ya Sayang! ❤️',
        ];
    }
}
