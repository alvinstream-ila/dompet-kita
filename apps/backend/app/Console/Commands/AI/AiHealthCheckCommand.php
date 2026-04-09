<?php

declare(strict_types=1);

namespace App\Console\Commands\AI;

use App\Actions\AI\SystemHealthCheckAction;
use Illuminate\Console\Command;

class AiHealthCheckCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:health';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '🩺 Check AI system and infrastructure connectivity';

    /**
     * Execute the console command.
     */
    public function handle(SystemHealthCheckAction $action): int
    {
        $this->info('🩺 DOMPET KITA - AI SYSTEM HEALTH CHECK');
        $this->info('========================================');

        $report = $action->execute();

        $this->line('   Database     : '.$this->getStatusLine($report['database']));
        $this->line('   Redis        : '.$this->getStatusLine($report['redis']));
        $this->line('   AI Provider  : '.$this->getStatusLine($report['ai_provider']));

        $this->info('========================================');

        if ($report['overall_status'] === 'safe') {
            $this->info('✅ ALL SYSTEMS OPERATIONAL');

            return 0;
        }

        $this->error('🚨 SYSTEM DEGRADED');

        return 1;
    }

    /**
     * @param  array{status: string, message: string}  $status
     */
    private function getStatusLine(array $status): string
    {
        $label = $status['status'] === 'safe' ? '<info>SAFE</info>' : '<error>'.strtoupper($status['status']).'</error>';

        return "[$label] ".$status['message'];
    }
}
