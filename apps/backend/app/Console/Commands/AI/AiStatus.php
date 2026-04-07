<?php

declare(strict_types=1);

namespace App\Console\Commands\AI;

use App\Actions\AI\GetAiSystemStatusAction;
use Illuminate\Console\Command;

class AiStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Display the current health and performance of the AI Multi-Provider system.';

    /**
     * Execute the console command.
     */
    public function handle(GetAiSystemStatusAction $action): int
    {
        $this->info("\n🤖 Dompet Kita AI Multi-Provider Status");
        $this->info('========================================');

        $statusData = $action->execute();

        $tableData = array_map(fn ($s) => [
            $s['name'],
            $s['status'],
            $s['latency'],
            $s['tokens_in'],
            $s['tokens_out'],
            $s['tokens_total'],
        ], $statusData);

        $this->table(['Provider', 'Status', 'Avg Latency', 'In Tokens', 'Out Tokens', 'Total'], $tableData);

        $this->info("\n[Self-Healing] System will automatically quarantine providers after 3 consecutive failures.");
        $this->info("[Failover] High-priority provider is favored, emergency backup is only used if fallback fails.\n");

        return 0;
    }
}
