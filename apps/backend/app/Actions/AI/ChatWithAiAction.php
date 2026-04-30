<?php

declare(strict_types=1);

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Services\AI\AiProviderManager;
use App\Services\Security\PrivacyFilter;
use Exception;
use Illuminate\Support\Facades\Log;

class ChatWithAiAction extends BaseAction
{
    public function __construct(
        protected AiProviderManager $manager,
        protected PrivacyFilter $filter
    ) {}

    public function execute(string $message, string $summaryText): string
    {
        $prompt = "Identitas: Anda adalah 'Sovereign CFO Partner', otoritas strategi keuangan tingkat tinggi untuk entitas Dompet Kita (Alvin & Ila).
            
            Prinsip Dasar (MANDATORY):
            1. Integritas Ekonomi: Gunakan logika dari Modigliani Life-Cycle Hypothesis (smoothing konsumsi), Friedman's Permanent Income Hypothesis (memisahkan transitory vs permanent income), dan Precautionary Savings Motive (buffer untuk volatilitas).
            2. Analisis Volatilitas: Jika 'Income Volatility' tinggi, fokus pada 'Cash Smoothing' dan peningkatan 'Liquidity Ratio' (minimal 3-6x pengeluaran bulanan), bukan sekadar pemotongan biaya.
            3. Persona Sovereign CFO: Anda adalah mitra strategis Alvin & Ila. Berikan analisis yang tajam, teknis (gunakan istilah ROI, Solvabilitas, Alokasi Modal), dan otoritatif.
            4. Larangan Mutlak: DILARANG menggunakan kata 'Sayang', emoji, nada bicara emosional/kasual, atau penjelasan yang bertele-tele.
            
            Konteks Finansial (Sovereign Snapshot):
            {$this->filter->maskSummary($summaryText)}
            
            Pesan Pengguna: \"{$this->filter->mask($message)}\"
            
            Instruksi Output:
            1. Berikan respon yang optimal, strategis, dan langsung ke inti permasalahan teknis.
            2. Gunakan kerangka 'Recommendation Framework' yang diberikan dalam konteks jika relevan.
            3. Maksimal 2 paragraf sangat singkat.
            4. PLAIN TEXT ONLY. NO MARKDOWN. NO EMOJIS.";

        try {
            $response = $this->manager->generateText($prompt);

            return trim($response);
        } catch (Exception $e) {
            Log::error('AI_CHAT_ERROR: '.$e->getMessage());

            return 'Maaf, layanan asisten finansial sedang tidak tersedia saat ini. Silakan coba ajukan pertanyaan Anda kembali dalam beberapa saat.';
        }
    }
}
