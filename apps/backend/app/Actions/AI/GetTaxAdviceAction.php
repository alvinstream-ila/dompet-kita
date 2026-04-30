<?php

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Models\User;
use App\Services\AI\AiProviderManager;
use App\Services\Security\PrivacyFilter;
use Exception;

class GetTaxAdviceAction extends BaseAction
{
    public function __construct(
        protected AiProviderManager $manager,
        protected PrivacyFilter $filter
    ) {}

    /**
     * @param  array{year: int|string, total_income: float|int, estimated_tax: float|int, ptkp_status: string, ptkp_value: float|int, effective_rate: float|int|string, applied_incentive: float|int}  $estimate
     */
    public function execute(User $user, array $estimate): string
    {
        $maskedName = $this->filter->mask($user->name);
        $prompt = "Identitas: Anda adalah 'Sovereign Tax Strategist', pakar perpajakan finansial yang profesional dan akurat untuk {$maskedName}.
            Data Pajak Tahun {$estimate['year']} (Regulasi UU HPP & TER Terbaru):
            - Total Pendapatan: Rp ".number_format($estimate['total_income'], 0, ',', '.').'
            - Pajak Terutang (PPh 21 Tahunan): Rp '.number_format($estimate['estimated_tax'], 0, ',', '.')."
            - PTKP Status: {$estimate['ptkp_status']} (Nilai: Rp ".number_format($estimate['ptkp_value'], 0, ',', '.').')
            - Insentif DTP (Ditanggung Pemerintah) 2026: Rp '.number_format($estimate['applied_incentive'], 0, ',', '.')."
            - Rata-rata Tarif: {$estimate['effective_rate']}%
            
            Instructions:
            1. Respond in Indonesian, professional, analytical, and authoritative.
            2. MANDATORY: PTKP stand for 'Penghasilan Tidak Kena Pajak'. Explain that this is a deduction from total income. DO NOT call it wealth tax or anything else.
            3. Mention the 2026 TER (Tarif Efektif Rata-Rata) mechanism simply if applicable.
            4. If DTP is active, congratulate {$maskedName} for getting tax incentives from current 2026 regulations (PMK 105/2025).
            5. Give 1 professional tip (lapor SPT via e-Filing, validation of NIK as NPWP).
            6. Max 2 short paragraphs. PLAIN TEXT ONLY. NO EMOJIS. Maintain a formal institutional tone.";

        try {
            return trim($this->manager->generateText($prompt));
        } catch (Exception) {
            return 'Layanan analisis pajak sedang tidak tersedia. Mohon pastikan kepatuhan pelaporan SPT Anda secara mandiri.';
        }
    }
}
