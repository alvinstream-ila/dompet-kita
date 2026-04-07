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

        return collect($status)->map(function (array $s) {
            $usage = AiWatchdog::getTokenUsage(strtolower($s['name']));

            return [
                'name' => (string) $s['name'],
                'status' => (string) $s['status'],
                'latency' => $s['recent_latency'] > 0 ? $s['recent_latency'].'s' : 'N/A',
                'tokens_in' => number_format((float) ($usage['prompt'] ?? 0)),
                'tokens_out' => number_format((float) ($usage['completion'] ?? 0)),
                'tokens_total' => number_format((float) ($usage['total'] ?? 0)),
            ];
        })->toArray();
    }
}
