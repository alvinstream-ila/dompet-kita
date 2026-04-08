<?php

declare(strict_types=1);

namespace App\Console\Commands\System;

use App\Actions\System\BackupDatabaseAction;
use App\Services\SentinelService;
use Exception;
use Illuminate\Console\Command;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:database';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export Supabase Database, ENCRYPT, and upload to Storj';

    /**
     * Execute the console command.
     */
    public function handle(BackupDatabaseAction $action, SentinelService $sentinel): int
    {
        try {
            $this->info('Starting database backup...');

            $result = $action->execute();

            $this->info("Backup completed & encrypted successfully: {$result['path']}");

            $sentinel->notify(
                "BACKUP SUCCESS 🛡️\nDatabase berhasil di-backup dan di-enkripsi (AES-256).\nFile: `{$result['filename']}`\nStatus: Secure in Storj.",
                'info'
            );

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");
            $sentinel->notify("BACKUP FAILED 🚨: {$e->getMessage()}", 'critical');

            return 1;
        }
    }
}
