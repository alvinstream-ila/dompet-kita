<?php

declare(strict_types=1);

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Models\User;
use App\Services\AI\AiProviderManager;
use App\Services\Security\PrivacyFilter;
use Exception;

class GetLegacyAdviceAction extends BaseAction
{
    public function __construct(
        private readonly AiProviderManager $manager,
        private readonly PrivacyFilter $filter
    ) {}

    /**
     * @param  array{financial_summary: array{total_assets: float|int, total_loans: float|int, total_goals: float|int}}  $report
     */
    public function execute(User $user, array $report): string
    {
        $prompt = "Identitas: Anda adalah 'Legacy Preservation Strategist', konsultan perencanaan kekayaan antar-generasi untuk Klien Dompet Kita.
            Snapshot Keuangan:
            - Aset: Rp ".number_format($report['financial_summary']['total_assets'], 0, ',', '.')."\n"
            .'            - Pinjaman: Rp '.number_format($report['financial_summary']['total_loans'], 0, ',', '.')."\n"
            .'            - Target Tabungan: Rp '.number_format($report['financial_summary']['total_goals'], 0, ',', '.')."\n"
            .'            
            Instructions:
            1. Respond in Indonesian, formal and objective.
            2. Berikan saran mengenai pentingnya snapshot ini untuk manajemen warisan digital.
            3. Berikan 1 saran profesional untuk mengamankan informasi ini atau meningkatkan lintasan kekayaan.
            4. Catatan Akhir: Sebutkan tanggal pembuatan laporan sebagai bagian dari linimasa legal untuk Klien.
            5. Maksimal 2 paragraf pendek. TEKS POLOS SAJA. TANPA EMOJI.';

        try {
            return trim($this->manager->generateText($prompt));
        } catch (Exception) {
            return 'Informasi manajemen warisan digital ini sangat krusial bagi keberlangsungan aset Anda di masa depan. Pastikan data ini tersimpan dengan aman.';
        }
    }
}
