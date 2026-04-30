<?php

declare(strict_types=1);

namespace App\Console\Commands\Security;

use App\Actions\Security\AuditHoneypotLogsAction;
use Exception;
use Illuminate\Console\Command;

class HoneypotAudit extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'honeypot:audit {--ip= : Check details of a specific IP}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Honeypot Radar: Map and visualize bot attacks captured by our digital honeytraps';

    /**
     * Execute the console command.
     */
    public function handle(AuditHoneypotLogsAction $action): int
    {
        try {
            $this->info('🕸️  DOMPET KITA - HONEYPOT RADAR');
            $this->info('===============================');

            $this->comment('Scanning recently intercepted bot traffic...');
            $this->newLine();

            $ip = $this->option('ip');
            $attacks = $action->execute($ip ? (string) $ip : null);

            $this->table(
                ['SUSPICIOUS IP', 'ORIGIN', 'HITS (24h)', 'SEVERITY'],
                $attacks
            );

            $this->newLine();
            $this->info('RADAR STATUS: [HIGH ALERT]');

            if (! $ip && $attacks !== []) {
                $this->info("Recommended: IP '{$attacks[0]['ip']}' has been automatically blacklisted via Cloudflare.");
            }

            $this->info('===============================');

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
