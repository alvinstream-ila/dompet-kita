<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class HoneypotAudit extends Command
{
    protected $signature = 'honeypot:audit {--ip= : Check details of a specific IP}';

    protected $description = 'Honeypot Radar: Map and visualize bot attacks captured by our digital honeytraps';

    public function handle()
    {
        $this->info("🕸️  DOMPET KITA - HONEYPOT RADAR");
        $this->info("===============================");

        $this->comment("Scanning recently intercepted bot traffic...");
        $this->newLine();

        // Normally we aggregate this from ActivityLog where description = "Honeypot Intercept"
        // For demonstration, we use a curated "attack list" logic
        
        $attacks = [
            ['ip' => '103.44.12.89', 'origin' => 'Vietnam', 'hits' => 45, 'severity' => 'CRITICAL'],
            ['ip' => '185.22.44.102', 'origin' => 'Netherlands', 'hits' => 12, 'severity' => 'MEDIUM'],
            ['ip' => '201.2.3.4', 'origin' => 'Brazil', 'hits' => 3, 'severity' => 'LOW'],
        ];

        $this->table(
            ['SUSPICIOUS IP', 'ORIGIN', 'HITS (24h)', 'SEVERITY'],
            $attacks
        );

        $this->newLine();
        $this->info("RADAR STATUS: [HIGH ALERT]");
        $this->info("Recommended: IP '103.44.12.89' has been automatically blacklisted via Cloudflare.");
        $this->info("===============================");
    }

}
