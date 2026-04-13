<?php

namespace App\Console\Commands;

use App\Services\AI\GroqProvider;
use Illuminate\Console\Command;

class TestLangSmithTrace extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-langsmith';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verification command for LangSmith AI Tracing connectivity';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🚀 Antigravity LangSmith Connectivity Test Starting...');

        try {
            $groq = new GroqProvider;
            $this->info('📡 Sending request to Groq (Primary Provider)...');

            $result = $groq->generateText('Balas dengan satu kata: OK.');

            $this->info('✅ Response: '.$result['text']);
            $this->info('📊 Usage: '.((int) $result['usage']['total_tokens']).' tokens');
            $this->info('⭐ Trace sent to LangSmith. Check your dashboard at https://smith.langchain.com/');

        } catch (\Exception $e) {
            $this->error('❌ Test failed: '.$e->getMessage());
            $this->error($e->getTraceAsString());
        }

        return 0;
    }
}
