<?php

declare(strict_types=1);

namespace App\Console\Commands\AI;

use App\Actions\AI\GuardianAnalyzeAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;

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
            $users = $this->getUsers();

            if ($users->isEmpty()) {
                $this->warn('No users found for analysis.');

                return self::SUCCESS;
            }

            foreach ($users as $user) {
                $this->processUser($user, $action);
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

    /**
     * Get users based on command options.
     *
     * @return Collection<int, User>
     */
    private function getUsers(): Collection
    {
        $userId = $this->option('user');

        if ($userId) {
            return User::where('id', $userId)->get();
        }

        // Use lazy() to avoid loading all users into memory at once in production
        return User::all();
    }

    /**
     * Process analysis for a single user.
     */
    private function processUser(User $user, GuardianAnalyzeAction $action): void
    {
        $this->comment("\n🔍 Analyzing data for: {$user->name}");

        try {
            /** @var array{current_cash: float, burn_rate: float, days_remaining: float, status: string, message: string, ai_advice: string|null, opportunities: array<int, array{action: string, reason: string}>} $result */
            $result = $action->execute($user);
            $result['days_remaining'] = (int) $result['days_remaining'];
            $this->renderResult($result);
        } catch (Exception $e) {
            $this->error("   ❌ Error analyzing user {$user->name}: {$e->getMessage()}");
        }
    }

    /**
     * Render the analysis result to the console.
     *
     * @param  array{current_cash: float|int, burn_rate: float|int, days_remaining: int, status: string, message: string, ai_advice: ?string, opportunities: array<int, array{action: string, reason: string}>}  $result
     */
    private function renderResult(array $result): void
    {
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
    }
}
