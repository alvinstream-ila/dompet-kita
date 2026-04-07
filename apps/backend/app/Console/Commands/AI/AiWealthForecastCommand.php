<?php

declare(strict_types=1);

namespace App\Console\Commands\AI;

use App\Actions\Finance\Wealth\ForecastWealthAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class AiWealthForecastCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:wealth-forecast {user_id} {--months=12}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a 12-month wealth growth projection using AI';

    /**
     * Execute the console command.
     */
    public function handle(ForecastWealthAction $forecastWealthAction): int
    {
        try {
            $userId = $this->argument('user_id');
            $months = (int) $this->option('months');
            $user = User::find($userId);

            if (! $user) {
                $this->error("User with ID {$userId} not found.");

                return 1;
            }

            $this->info("🚀 Generating Wealth Forecast for {$user->name}...");
            $data = $forecastWealthAction->execute($user, $months);

            $this->newLine();
            $this->info('📊 Current Net Worth: Rp '.number_format((float) $data['current_net_worth'], 0, ',', '.'));
            $this->info('💰 Avg Monthly Savings: Rp '.number_format((float) $data['avg_monthly_savings'], 0, ',', '.'));

            $this->newLine();
            $this->table(
                ['Month', 'Estimated Net Worth'],
                $data['projection']
            );

            $this->newLine();
            $this->comment('🤖 AI Advisor Says:');
            $this->line($data['advice']);

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
