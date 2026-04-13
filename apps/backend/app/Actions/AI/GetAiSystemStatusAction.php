<?php

declare(strict_types=1);

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Services\AI\AiWatchdog;

class GetAiSystemStatusAction extends BaseAction
{
    /**
     * Retrieve global AI system status and provider metrics.
     *
     * @return array<int, array{
     *     name: string,
     *     status: string,
     *     latency: string,
     *     tokens_in: string,
     *     tokens_out: string,
     *     tokens_total: string
     * }>
     */
    public function execute(): array
    {
        $status = AiWatchdog::getStatus();

        return array_map(function (array $s): array {
            $usage = AiWatchdog::getTokenUsage((string) $s['name']);

            return [
                'name' => (string) $s['name'],
                'status' => (string) $s['status'],
                'latency' => (string) $s['recent_latency'].'s',
                'tokens_in' => number_format((float) $usage['prompt']),
                'tokens_out' => number_format((float) $usage['completion']),
                'tokens_total' => number_format((float) $usage['total']),
            ];
        }, array_values($status));
    }
}
