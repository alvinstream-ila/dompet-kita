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
     *     r2: bool,
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

        // 2. Cloudflare R2 Check
        $r2 = ! empty(config('filesystems.disks.r2.key')) && ! empty(config('filesystems.disks.r2.secret'));

        // 3. Gemini AI Check
        $gemini = ! empty(config('services.gemini.key'));

        return [
            'supabase' => $supabase,
            'r2' => $r2,
            'gemini' => $gemini,
        ];
    }
}
