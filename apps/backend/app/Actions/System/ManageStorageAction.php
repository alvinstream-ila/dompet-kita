<?php

declare(strict_types=1);

namespace App\Actions\System;

use App\Actions\BaseAction;
use Exception;
use Illuminate\Support\Facades\Storage;

class ManageStorageAction extends BaseAction
{
    /**
     * List files in specific cloud disk.
     *
     * @return array<int, array{name: string, size: int}>
     */
    public function listFiles(string $disk = 's3'): array
    {
        if (! config("filesystems.disks.{$disk}.key")) {
            throw new Exception("Storage disk '{$disk}' configuration is missing.");
        }

        $files = Storage::disk($disk)->allFiles();
        $result = [];

        foreach ($files as $file) {
            $result[] = [
                'name' => $file,
                'size' => (int) Storage::disk($disk)->size($file),
            ];
        }

        return $result;
    }
}
