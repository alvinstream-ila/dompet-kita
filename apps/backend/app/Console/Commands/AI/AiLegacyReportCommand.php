<?php

declare(strict_types=1);

namespace App\Console\Commands\AI;

use App\Actions\Security\DeadMansSwitch\GenerateReportAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class AiLegacyReportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:legacy-report {user_id? : The ID of the user to generate report for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '🏛️ Generate inheritance financial snapshot untuk masa depan';

    /**
     * Execute the console command.
     */
    public function handle(GenerateReportAction $generateReportAction): int
    {
        try {
            $userId = (int) ($this->argument('user_id') ?: 1);
            $user = User::find($userId);

            if (! $user) {
                $this->error("User with ID {$userId} not found.");

                return 1;
            }

            $this->info("🏛️ Generating digital inheritance snapshot for: {$user->name}");

            $report = $generateReportAction->execute($user);

            $this->info('✅ Snapshot Generated Successfully!');
            $this->line('');

            $this->warn('Aset Terdata (Total: Rp '.number_format((float) $report['financial_summary']['total_assets'], 0, ',', '.').'):');
            $this->table(['Nama Aset', 'Nilai'], $report['asset_details']->toArray());

            $this->warn('Utang Aktif (Total: Rp '.number_format((float) $report['financial_summary']['total_loans'], 0, ',', '.').'):');
            $this->table(['Debitur', 'Nilai', 'Jatuh Tempo'], $report['active_loans']->toArray());

            $this->line('');
            $this->info('💡 Rekomendasi Warisan Digital:');
            foreach ($report['recommendations'] as $rec) {
                $this->bullet((string) $rec);
            }

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }

    /**
     * Helper to list bullets.
     */
    protected function bullet(string $text): void
    {
        $this->line("  • <info>{$text}</info>");
    }
}
