<?php

declare(strict_types=1);

namespace App\Console\Commands\AI;

use App\Actions\AI\GetTaxAdviceAction;
use App\Actions\Finance\Tax\CalculateTaxAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class AiTaxEstimateCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:tax-estimate {user_id? : The ID of the user to estimate} {year? : The year for tax estimation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '🧾 Estimasi pajak tahunan otomatis berdasarkan riwayat transaksi (PPh 21)';

    /**
     * Execute the console command.
     */
    public function handle(CalculateTaxAction $calculateAction, GetTaxAdviceAction $adviceAction): int
    {
        try {
            $userId = (int) ($this->argument('user_id') ?: 1);
            $year = (int) ($this->argument('year') ?: now()->year);
            $user = User::find($userId);

            if (! $user) {
                $this->error("User with ID {$userId} not found.");

                return 1;
            }

            $this->info("🤖 Menghitung estimasi pajak untuk: {$user->name} (Tahun: {$year})");

            $estimateData = $calculateAction->execute($user, $year);
            $monthlyTax = $estimateData['estimated_tax'] / 12;

            $aiAdvice = $adviceAction->execute($user, $estimateData);

            $this->table(
                ['Parameter', 'Value'],
                [
                    ['Total Income', 'Rp '.number_format($estimateData['total_income'], 0, ',', '.')],
                    ['PTKP', 'Rp '.number_format($estimateData['ptkp'], 0, ',', '.')],
                    ['Taxable Income', 'Rp '.number_format($estimateData['taxable_income'], 0, ',', '.')],
                    ['Estimated Tax (Annual)', 'Rp '.number_format($estimateData['estimated_tax'], 0, ',', '.')],
                    ['Monthly Tax', 'Rp '.number_format($monthlyTax, 0, ',', '.')],
                    ['Effective Rate', $estimateData['effective_rate'].'%'],
                ]
            );

            $this->line('');
            $this->info('💡 Nasihat AI:');
            $this->comment($aiAdvice);

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
