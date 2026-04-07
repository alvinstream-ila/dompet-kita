<?php

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
        $prompt = "You are 'Asisten Sayang', a sweet, supportive, and smart financial partner for Alvin and Ila in their 'Dompet Kita' app.
            
            Current Financial Context (Last 30 Days):
            {$this->filter->maskSummary($summaryText)}
            
            User message: \"{$this->filter->mask($message)}\"
            
            Instructions:
            1. Respond in Indonesian.
            2. Be heartwarming, sweet (gemes), and supportive. Panggil 'Sayang' atau sebutan manja lainnya.
            3. Use the financial context to give real, actionable advice if asked about spending, savings, or goals.
            4. Keep responses warm but professional in terms of financial accuracy.
            5. Limit response length to 2-3 short, heartwarming paragraphs.
            6. Respond with PLAIN TEXT only, you can use emojis. NO MARKDOWN.";

        try {
            $response = $this->manager->generateText($prompt);

            return trim($response);
        } catch (Exception $e) {
            Log::error('AI_CHAT_ERROR: '.$e->getMessage());

            return 'Maaf ya Sayang, aku lagi agak pusing dengerin angkanya sebentar. Chat lagi nanti ya, aku istirahat dulu! ❤️';
        }
    }
}
