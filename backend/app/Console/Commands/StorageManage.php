<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class StorageManage extends Command
{
    protected $signature = 'app:storage-manage {action=list} {--bucket=}';
    protected $description = 'Manage files in Storj Cloud Object Storage';

    public function handle()
    {
        $action = $this->argument('action');
        $disk = 's3'; // Storj uses S3 driver in our config

        if (!config("filesystems.disks.$disk.key")) {
            $this->error("Storj/S3 configuration is missing!");
            return;
        }

        switch ($action) {
            case 'list':
                $this->listFiles($disk);
                break;
            default:
                $this->error("Action '$action' not implemented yet.");
        }
    }

    private function listFiles($disk)
    {
        $this->info("### 📦 Files in Cloud Storage (Storj)");
        
        try {
            $files = Storage::disk($disk)->allFiles();
            
            if (empty($files)) {
                $this->info("Storage is empty.");
                return;
            }

            foreach ($files as $file) {
                $size = Storage::disk($disk)->size($file);
                $this->line("- $file (" . number_format($size / 1024, 1) . " KB)");
            }
        } catch (\Exception $e) {
            $this->error("Failed to list files: " . $e->getMessage());
        }
    }
}
