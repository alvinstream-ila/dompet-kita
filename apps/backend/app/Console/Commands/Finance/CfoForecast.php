<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\Wealth\ForecastWealthAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class CfoForecast extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cfo:forecast {--months=12 : Number of months to forecast}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'AI CFO: Project wealth trajectory over the next N months using historical data';

    /**
     * Execute the console command.
     */
    public function handle(ForecastWealthAction $action): int
    {
        try {
            $this->info('📈 DOMPET KITA - WEALTH FORECAST ENGINE');
            $this->info('=======================================');

            $months = (int) $this->option('months');
            $this->comment("Projecting wealth trajectory for the next {$months} months...");

            $defaultUser = User::find(1);
            if (! $defaultUser) {
                $this->error('Primary user (ID 1) not found.');

                return 1;
            }

            $data = $action->execute($defaultUser, $months);

            $this->newLine();
            $this->info('📊 BASE DATA:');
            $this->line('  Current Net Worth   : Rp '.number_format((float) $data['current_net_worth'], 0, ',', '.'));
            $this->line('  Avg Monthly Savings : Rp '.number_format((float) $data['avg_monthly_savings'], 0, ',', '.'));

            $this->newLine();
            $this->info("🔮 PROJECTION (Next {$months} months):");

            $tableData = collect($data['projection'])->map(function ($item) {
                return [
                    'month' => $item['month'],
                    'projected' => 'Rp '.number_format((float) $item['estimated_net_worth'], 0, ',', '.'),
                ];
            })->toArray();

            $this->table(['Month', 'Projected Net Worth'], $tableData);

            $this->newLine();
            $this->warn('💡 AI Strategic Commentary:');
            $this->line($data['advice']);

            $this->info('=======================================');

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
