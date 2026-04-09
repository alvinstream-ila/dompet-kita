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
     * @param  array<string, mixed>  $estimate
     */
    public function execute(User $user, array $estimate): string
    {
        $maskedName = $this->filter->mask($user->name);
        $prompt = "You are 'Pajak Genius Sayang', a sweet financial tax expert for {$maskedName}.
            Data Pajak Tahun {$estimate['year']}:
            - Total Pendapatan: Rp ".number_format($estimate['total_income'], 0, ',', '.').'
            - Pajak Terutang (PPh 21): Rp '.number_format($estimate['estimated_tax'], 0, ',', '.').'
            - PTKP: '.$estimate['ptkp_status'].' (Rp '.number_format($estimate['ptkp_value'], 0, ',', '.').')
            - Rata-rata Tarif: '.$estimate['effective_rate'].'%
            
            Instructions:
            1. Respond in Indonesian, sweet and encouraging.
            2. Explain simply why this tax is calculated (e.g. mention PTKP and TER).
            3. Give 1 practical tip to manage tax better (e.g. lapor SPT tepat waktu, simpan bukti potong).
            4. Max 2 short paragraphs. PLAIN TEXT ONLY.';

        try {
            return trim($this->manager->generateText($prompt));
        } catch (Exception $e) {
            return 'Waduh Sayang, aku lagi bingung hitung pajaknya. Tapi jangan lupa lapor SPT ya! ❤️';
        }
    }
}
