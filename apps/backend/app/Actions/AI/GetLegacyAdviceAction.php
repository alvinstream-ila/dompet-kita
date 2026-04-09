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
     * @param  array<string, mixed>  $report
     */
    public function execute(User $user, array $report): string
    {
        $maskedName = $this->filter->mask($user->name);
        $prompt = "You are 'Guardian Sayang', protecting the financial future of {$maskedName} and their partner.
            Snapshot Keuangan:
            - Aset: Rp ".number_format($report['financial_summary']['total_assets'], 0, ',', '.').'
            - Pinjaman: Rp '.number_format($report['financial_summary']['total_loans'], 0, ',', '.').'
            - Target Tabungan: Rp '.number_format($report['financial_summary']['total_goals'], 0, ',', '.')."
            
            Instructions:
            1. Respond in Indonesian, warm and deeply caring.
            2. Mention the importance of this snapshot for 'Legacy' (warisan digital).
            3. Give 1 piece of advice on how to secure this information or improve the wealth trajectory.
            4. Max 2 short paragraphs. PLAIN TEXT ONLY.";

        try {
            return trim($this->manager->generateText($prompt));
        } catch (Exception $e) {
            return 'Sayang, catatan ini berharga banget buat masa depan kita. Simpan baik-baik ya! ❤️';
        }
    }
}
