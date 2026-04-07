<?php

declare(strict_types=1);

namespace App\Console\Commands\AI;

use App\Actions\AI\GuardianAnalyzeAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class AiGuardian extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:guardian {--user= : Analyze specific user ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'AI Guardian: Predict liquidity crisis and suggest critical rebalancing';

    /**
     * Execute the console command.
     */
    public function handle(GuardianAnalyzeAction $action): int
    {
        $this->info('🛡️  DOMPET KITA AI GUARDIAN - PROTECTING YOUR ASSETS');
        $this->info('================================================');

        try {
            $userId = $this->option('user');
            $users = $userId
                ? User::where('id', $userId)->get()
                : User::all();

            if ($users->isEmpty()) {
                $this->warn('No users found for analysis.');

                return self::SUCCESS;
            }

            foreach ($users as $user) {
                $this->comment("\n🔍 Analyzing data for: {$user->name}");

                try {
                    $result = $action->execute($user);

                    $this->line('   Current Cash  : Rp '.number_format((float) $result['current_cash']));
                    $this->line('   Daily Burn    : Rp '.number_format((float) $result['burn_rate']));
                    $this->line('   Days Remaining: '.($result['days_remaining'] > 300 ? 'Stable (>300)' : $result['days_remaining']));

                    if ($result['status'] !== 'safe') {
                        $this->error("   🚨 STATUS     : {$result['status']}");
                        $this->warn("   ⚠️  MESSAGE    : {$result['message']}");

                        if ($result['ai_advice']) {
                            $this->info('   ✨ AI STRATEGY ARROW:');
                            $this->line('      '.$result['ai_advice']);
                        }
                    } else {
                        $this->info('   ✅ STATUS     : SAFE (Everything looks good!)');

                        foreach ($result['opportunities'] as $adv) {
                            $this->warn('   💡 OPPORTUNITY: '.$adv['reason']);
                        }
                    }
                } catch (Exception $e) {
                    $this->error("   ❌ Error analyzing user {$user->name}: {$e->getMessage()}");
                }
            }
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return self::FAILURE;
        }

        $this->info("\n================================================");
        $this->info('🛡️  GUARDIAN SCAN COMPLETE');
        $this->info('================================================');

        return self::SUCCESS;
    }
}
