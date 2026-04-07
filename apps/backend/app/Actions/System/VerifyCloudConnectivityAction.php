<?php

declare(strict_types=1);

namespace App\Actions\System;

use App\Actions\BaseAction;
use Illuminate\Support\Facades\DB;

class VerifyCloudConnectivityAction extends BaseAction
{
    /**
     * Verify connectivity to various cloud services.
     *
     * @return array{
     *     supabase: bool,
     *     storj: bool,
     *     gemini: bool
     * }
     */
    public function execute(): array
    {
        // 1. Supabase Check
        $supabase = false;
        try {
            DB::connection()->getPdo();
            $supabase = true;
        } catch (\Exception) {
        }

        // 2. Storj Check
        $storj = ! empty(config('filesystems.disks.storj.key')) && ! empty(config('filesystems.disks.storj.secret'));

        // 3. Gemini AI Check
        $gemini = ! empty(config('services.gemini.key'));

        return [
            'supabase' => $supabase,
            'storj' => $storj,
            'gemini' => $gemini,
        ];
    }
}
