<?php

declare(strict_types=1);

namespace App\Actions\Finance;

use App\Actions\BaseAction;
use App\Jobs\Cfo\GenerateQuantumInsightsJob;
use App\Models\User;
use App\Services\Cfo\QuantumInsightEngine;

class GetQuantumInsightsAction extends BaseAction
{
    public function __construct(
        private readonly QuantumInsightEngine $engine
    ) {}

    /**
     * Generate insights for a specific user.
     */
    public function execute(User $user): void
    {
        GenerateQuantumInsightsJob::dispatch($user);
    }
}
