<?php

declare(strict_types=1);

namespace App\Console\Commands\System;

use App\Actions\System\GetSystemStatusAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class SystemStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Comprehensive Financial Snapshot Dashboard';

    /**
     * Execute the console command.
     */
    public function handle(GetSystemStatusAction $action): int
    {
        try {
            $this->info('========================================');
            $this->info('💎 DOMPET KITA - SENTIENT CORE STATUS (v6.3)');
            $this->info('========================================');

            $defaultUser = User::find(1);
            $data = $action->execute($defaultUser);

            // 1. Balance Summary
            $this->info('💳 SALDO AKTIF  : Rp '.number_format($data['active_balance'], 0, ',', '.'));

            // 2. Assets & Wealth Intelligence
            $this->info('💰 TOTAL ASET   : Rp '.number_format($data['total_assets'], 0, ',', '.'));
            $this->line('🏛️  NET WORTH   : Rp '.number_format($data['net_worth'], 0, ',', '.'));

            // 3. Security Sentinel Snapshot
            $this->line("\n--- 🛡️ SECURITY SENTINEL ---");
            if ($data['security_alerts'] > 0) {
                $this->error("🚩 ALERT AKTIF : {$data['security_alerts']} anomali terdeteksi dalam 7 hari terakhir.");
            } else {
                $this->info('✅ STATUS AMAN  : Tidak ada ancaman terdeteksi.');
            }

            // 4. Market Pulse
            $this->line("\n--- 📈 MARKET PULSE ---");
            $this->line('💵 USD/IDR      : Rp '.number_format($data['market']['usd_idr']));
            $this->line('🏆 GOLD/GRAM    : Rp '.number_format($data['market']['gold_gram']));

            // 5. Short-term Targets
            $this->line("\n--- 🎯 TOP TARGETS ---");
            if (empty($data['top_targets'])) {
                $this->line('  (No active goals)');
            } else {
                foreach ($data['top_targets'] as $target) {
                    $this->line("{$target['status_icon']} {$target['name']} (".number_format($target['percentage'], 1).'%)');
                }
            }

            $this->info("\n========================================");
            $this->info('✨ SENTIENCE SYNCHRONIZED. READY FOR COMMAND.');

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
