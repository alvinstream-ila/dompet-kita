<?php

namespace App\Console\Commands;

use App\Models\WealthHistory;
use App\Services\GeminiService;
use Illuminate\Console\Command;

class CfoForecast extends Command
{
    protected $signature = 'cfo:forecast {--months=12 : Number of months to forecast}';

    protected $description = 'AI CFO: Project wealth trajectory over the next N months using historical data';

    public function handle(GeminiService $gemini)
    {
        $this->info("📈 DOMPET KITA - WEALTH FORECAST ENGINE");
        $this->info("=======================================");

        $months = (int) $this->option('months');
        $this->comment("Projecting wealth trajectory for the next $months months...");

        // Fetch the last 6 months of wealth history as basis
        $history = WealthHistory::orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get(['month', 'year', 'total_value']);

        if ($history->isEmpty()) {
            $this->warn("No wealth history data found. Start tracking your assets first.");
            $this->line("  👉 Run: php artisan app:status");
            return;
        }

        // Calculate average monthly growth rate
        $values = $history->pluck('total_value')->toArray();
        $latestValue = $values[0] ?? 0;
        $oldestValue = end($values) ?: 1;
        $growthRate = count($values) > 1
            ? (($latestValue - $oldestValue) / $oldestValue) / count($values)
            : 0.01; // default 1% monthly growth

        $this->newLine();
        $this->info("📊 BASE DATA:");
        $this->line("  Current Net Worth   : Rp " . number_format($latestValue, 0, ',', '.'));
        $this->line("  Avg Monthly Growth  : " . round($growthRate * 100, 2) . "%");

        $this->newLine();
        $this->info("🔮 PROJECTION (Next $months months):");

        $tableData = [];
        $currentDate = now();
        $projectedValue = $latestValue;

        for ($i = 1; $i <= $months; $i++) {
            $projectedValue *= (1 + $growthRate);
            $projectedMonth = $currentDate->copy()->addMonths($i)->format('M Y');
            $tableData[] = [
                'month'     => $projectedMonth,
                'projected' => 'Rp ' . number_format($projectedValue, 0, ',', '.'),
                'delta'     => ($growthRate >= 0 ? '+' : '') . round($growthRate * 100, 2) . "%",
            ];
        }

        $this->table(['Month', 'Projected Net Worth', 'Monthly Delta'], $tableData);

        // AI Strategic Commentary
        $this->newLine();
        $this->warn("💡 Consulting AI for strategic commentary...");

        $prompt  = "Seorang CFO AI sedang menganalisis proyeksi kekayaan keluarga 'Dompet Kita' (Alvin & Ila). ";
        $prompt .= "Kekayaan bersih saat ini: Rp " . number_format($latestValue, 0, ',', '.') . ". ";
        $prompt .= "Rata-rata pertumbuhan bulanan: " . round($growthRate * 100, 2) . "%. ";
        $prompt .= "Proyeksi dalam $months bulan: Rp " . number_format($projectedValue, 0, ',', '.') . ". ";
        $prompt .= "Berikan 2 saran strategis singkat dalam Bahasa Indonesia dengan nada elegan dan penuh keyakinan.";

        $advice = $gemini->analyzeFinancials($prompt);

        $this->info("✨ STRATEGIC COMMENTARY:");
        $this->line($advice);
        $this->info("=======================================");
    }
}
