<?php

declare(strict_types=1);

namespace App\Actions\Security;

use App\Actions\BaseAction;

class AuditHoneypotLogsAction extends BaseAction
{
    /**
     * Audit recent bot attacks.
     *
     * @return array<int, array{ip: string, origin: string, hits: int, severity: string}>
     */
    public function execute(?string $ip = null): array
    {
        // In a real app, this would query activity_log or a dedicated honeypot_logs table
        // For now, we use a simulation pattern similar to the original command but in an Action

        $attacks = [
            ['ip' => '103.44.12.89', 'origin' => 'Vietnam', 'hits' => 45, 'severity' => 'CRITICAL'],
            ['ip' => '185.22.44.102', 'origin' => 'Netherlands', 'hits' => 12, 'severity' => 'MEDIUM'],
            ['ip' => '201.2.3.4', 'origin' => 'Brazil', 'hits' => 3, 'severity' => 'LOW'],
        ];

        if ($ip) {
            return array_values(array_filter($attacks, fn ($a) => $a['ip'] === $ip));
        }

        return $attacks;
    }
}
