<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use App\Services\GeminiService;
use Illuminate\Console\Command;

class CfoAnalyze extends Command
{
    protected $signature = 'cfo:analyze {--month= : Month for analysis (YYYY-MM)}';

    protected $description = 'AI CFO: Analyze monthly transactions and provide strategic financial insights';

    public function handle(GeminiService $gemini)
    {
        $this->info("💰 DOMPET KITA - CHIEF FINANCIAL OFFICER (AI)");
        $this->info("===========================================");

        $month = $this->option('month') ?: now()->format('Y-m');
        $this->comment("Analyzing data for: $month");

        $transactions = \App\Models\Transaction::where('date', 'like', "$month%")->get();

        if ($transactions->isEmpty()) {
            $this->warn("No transaction data found for $month.");
            return;
        }

        $summary = $transactions->groupBy('type')->map(fn($group) => $group->sum('amount'));
        $categories = $transactions->groupBy('category')->map(fn($group) => $group->sum('amount'));

        $prompt = "Sebagai asisten keuangan premium keluarga 'Dompet Kita' (Alvin & Ila), ";
        $prompt .= "analisislah ringkasan transaksi bulan $month berikut:\n\n";
        $prompt .= "Total Income: " . ($summary['income'] ?? 0) . "\n";
        $prompt .= "Total Expense: " . ($summary['expense'] ?? 0) . "\n";
        $prompt .= "Detail Kategori: " . json_encode($categories) . "\n\n";
        $prompt .= "Berikan 3 poin strategi finansial yang kritis, nada bicara elegan dan cerdas.";

        $this->warn("Consulting with Gemini AI...");
        $advice = $gemini->analyzeFinancials($prompt);

        $this->info("✨ STRATEGIC INSIGHTS:");
        $this->line($advice);
        
        $this->info("===========================================");
    }

}
