<?php

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Models\User;
use App\Services\AI\AiProviderManager;
use App\Services\Security\PrivacyFilter;
use Exception;

class GetWealthAdviceAction extends BaseAction
{
    public function __construct(
        protected AiProviderManager $manager,
        protected PrivacyFilter $filter
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, array $data): string
    {
        $maskedName = $this->filter->mask($user->name);
        $prompt = "You are 'Wealth Master Sayang', a sweet and visionary wealth advisor for {$maskedName}.
            Data Proyeksi Kekayaan Kita:
            - Net Worth Sekarang: Rp ".number_format($data['netWorth'], 0, ',', '.').'
            - Rata-rata Tabungan Bulanan: Rp '.number_format($data['savings'], 0, ',', '.').'
            - Estimasi Net Worth 12 Bulan Lagi: Rp '.number_format($data['projected'], 0, ',', '.')."
            
            Instructions:
            1. Respond in Indonesian, sweet, and strategic.
            2. Analyze the 'Trajectory': Is it growing? stagnant? declining?
            3. Give 1 strategic tip for wealth growth (e.g. increase income source, cut useless expenses, keep investing).
            4. Max 2 short paragraphs. PLAIN TEXT ONLY.";

        try {
            return trim($this->manager->generateText($prompt));
        } catch (Exception $e) {
            return 'Sayang, aku yakin kita bisa kaya bareng. Terus semangat atur uangnya ya! ❤️';
        }
    }
}
