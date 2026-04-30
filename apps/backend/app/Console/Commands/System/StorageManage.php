<?php

declare(strict_types=1);

namespace App\Console\Commands\System;

use App\Actions\System\ManageStorageAction;
use Exception;
use Illuminate\Console\Command;

class StorageManage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:storage-manage {action=list} {--bucket=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage files in Storj Cloud Object Storage';

    /**
     * Execute the console command.
     */
    public function handle(ManageStorageAction $action): int
    {
        try {
            $subAction = $this->argument('action');

            return match ($subAction) {
                'list' => $this->handleList($action),
                default => $this->handleInvalidAction((string) $subAction),
            };
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }

    private function handleList(ManageStorageAction $action): int
    {
        $this->info('### 📦 Files in Cloud Storage (Storj)');

        $files = $action->listFiles('s3'); // Disk configured as 's3' for Storj

        if ($files === []) {
            $this->info('Storage is empty.');

            return 0;
        }

        foreach ($files as $file) {
            $this->line("- {$file['name']} (".number_format($file['size'] / 1024, 1).' KB)');
        }

        return 0;
    }

    private function handleInvalidAction(string $action): int
    {
        $this->error("Action '{$action}' not implemented yet.");

        return 1;
    }
}
