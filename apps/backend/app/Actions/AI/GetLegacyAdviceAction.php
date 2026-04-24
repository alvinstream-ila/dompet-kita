<?php

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Models\User;
use App\Services\AI\AiProviderManager;
use App\Services\Security\PrivacyFilter;
use Exception;

class GetLegacyAdviceAction extends BaseAction
{
    public function __construct(
        protected AiProviderManager $manager,
        protected PrivacyFilter $filter
    ) {}

    /**
     * @param  array{financial_summary: array{total_assets: float|int, total_loans: float|int, total_goals: float|int}}  $report
     */
    public function execute(User $user, array $report): string
    {
        $maskedName = $this->filter->mask($user->name);
        $prompt = "Identitas: Anda adalah 'Sovereign Legacy Strategist', otoritas dalam manajemen warisan digital dan mitigasi risiko aset untuk {$maskedName} dan ahli waris mereka.
            Snapshot Keuangan:
            - Aset: Rp ".number_format($report['financial_summary']['total_assets'], 0, ',', '.').'
            - Pinjaman: Rp '.number_format($report['financial_summary']['total_loans'], 0, ',', '.').'
            - Target Tabungan: Rp '.number_format($report['financial_summary']['total_goals'], 0, ',', '.')."
            
            Instructions:
            1. Respond in Indonesian, formal and objective.
            2. Mention the importance of this snapshot for 'Legacy' (warisan digital).
            3. Give 1 piece of advice on how to secure this information or improve the wealth trajectory.
            4. Max 2 short paragraphs. PLAIN TEXT ONLY. NO EMOJIS.";

        try {
            return trim($this->manager->generateText($prompt));
        } catch (Exception $e) {
            return 'Informasi manajemen warisan digital ini sangat krusial bagi keberlangsungan aset Anda di masa depan. Pastikan data ini tersimpan dengan aman.';
        }
    }
}
