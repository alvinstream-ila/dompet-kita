<?php

declare(strict_types=1);

namespace App\Actions\System;

use App\Actions\BaseAction;
use Illuminate\Support\Facades\Artisan;
use Spatie\Activitylog\Models\Activity;

class OptimizeDatabaseAction extends BaseAction
{
    /**
     * Perform database and system optimization.
     *
     * @return array{pruned_logs: int}
     */
    public function execute(): array
    {
        // 1. Clear Application Caches
        Artisan::call('optimize:clear');

        // 2. Prune Activity Logs
        $deletedCount = Activity::where('created_at', '<', now()->subDays(30))->delete();

        // 3. System Optimization
        Artisan::call('optimize');

        return [
            'pruned_logs' => (int) $deletedCount,
        ];
    }
}
