<?php

declare(strict_types=1);

namespace App\Actions\System;

use App\Actions\BaseAction;
use App\Services\SentinelService;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Storage;

class BackupDatabaseAction extends BaseAction
{
    public function __construct(private readonly SentinelService $sentinel) {}

    /**
     * Run full database backup cycle.
     *
     * @return array{filename: string, path: string}
     */
    public function execute(): array
    {
        $dbUrl = (string) config('database.connections.pgsql.url');
        if ($dbUrl === '' || $dbUrl === '0') {
            throw new Exception('DB_URL is not configured.');
        }

        $timestamp = Carbon::now()->format('Y-m-d-His');
        $filename = "backup-{$timestamp}.sql";
        $tempPath = storage_path("app/{$filename}");

        // 1. Export
        $this->export($dbUrl, $tempPath);

        // 2. Encrypt
        $encryptionKey = (string) config('app.backup_password', 'antigravity-secret-123');
        $encryptedFilename = "{$filename}.enc";
        $encryptedPath = storage_path("app/{$encryptedFilename}");
        $this->encrypt($tempPath, $encryptedPath, $encryptionKey);

        // 3. Upload
        $this->upload($encryptedPath, "backups/{$encryptedFilename}");

        // 4. Cleanup
        if (file_exists($tempPath)) {
            @unlink($tempPath);
        }
        if (file_exists($encryptedPath)) {
            @unlink($encryptedPath);
        }

        return [
            'filename' => $encryptedFilename,
            'path' => "backups/{$encryptedFilename}",
        ];
    }

    private function export(string $dbUrl, string $path): void
    {
        $command = "pg_dump \"{$dbUrl}\" > \"{$path}\"";
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            throw new Exception('Failed to export database via pg_dump.');
        }
    }

    private function encrypt(string $source, string $dest, string $key): void
    {
        $command = "openssl enc -aes-256-cbc -salt -in \"{$source}\" -out \"{$dest}\" -k \"{$key}\" -pbkdf2";
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            $this->sentinel->notify('Encryption failed for database backup.', 'critical', ['source' => $source]);
            throw new Exception('Failed to encrypt backup file.');
        }
    }

    private function upload(string $path, string $remotePath): void
    {
        $content = file_get_contents($path);
        if ($content === false) {
            throw new Exception('Failed to read encrypted backup file.');
        }

        Storage::disk('storj')->put($remotePath, $content);
    }
}
