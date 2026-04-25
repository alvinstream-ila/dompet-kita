<?php

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Exceptions\AnalyzeReceiptException;
use App\Services\AI\AiProviderManager;
use App\Services\Security\PrivacyFilter;
use Exception;
use Illuminate\Support\Facades\Log;

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
            throw new AnalyzeReceiptException('Layanan analisis AI sedang mengalami kendala teknis: '.$msg);
        }

        if (preg_match('/\{.*\}/s', $jsonText, $matches)) {
            $jsonText = $matches[0];
        }

        $result = json_decode(trim($jsonText), true);

        if (! is_array($result)) {
            Log::error('AI_SCAN_PARSING_FAILED', ['raw' => $jsonText]);
            throw new AnalyzeReceiptException('Sistem gagal memproses data struk ini. Silakan lakukan input data secara manual.');
        }

        /** @var mixed $rawAmount */
        $rawAmount = $result['amount'] ?? 0;
        $cleanAmount = (int) preg_replace('/\D/', '', is_scalar($rawAmount) ? (string) $rawAmount : '0');

        return [
            'amount' => $cleanAmount,
            'merchant' => is_string($result['merchant'] ?? null) ? (string) $result['merchant'] : 'Toko Tidak Terbaca',
            'category' => is_string($result['category'] ?? null) ? (string) $result['category'] : 'Belanja',
            'message' => is_string($result['message'] ?? null) ? (string) $result['message'] : 'Analisis struk berhasil. Data nominal telah disinkronkan secara otomatis.',
        ];
    }
}
