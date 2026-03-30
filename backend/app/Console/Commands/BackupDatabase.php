<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:database';

    protected $description = 'Export Supabase Database and upload to Storj';

    public function handle()
    {
        $this->info('Starting database backup...');

        $dbUrl = config('database.connections.pgsql.url');
        if (! $dbUrl) {
            $this->error('DB_URL is not configured.');

            return 1;
        }

        $filename = 'backup-'.now()->format('Y-m-d-His').'.sql';
        $tempPath = storage_path('app/'.$filename);

        // Run pg_dump
        // Note: Production (Railway) has pg_dump installed.
        $command = "pg_dump \"$dbUrl\" > \"$tempPath\"";

        $this->info('Exporting database to temp file...');
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            $this->error('Failed to export database. Make sure pg_dump is installed.');

            return 1;
        }

        $this->info('Uploading to Storj...');
        $content = file_get_contents($tempPath);
        Storage::disk('storj')->put('backups/'.$filename, $content);

        // Cleanup
        unlink($tempPath);

        $this->info("Backup completed successfully: backups/$filename");

        return 0;
    }
}
