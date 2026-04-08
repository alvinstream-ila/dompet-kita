<?php

declare(strict_types=1);

namespace App\Actions\System;

use App\Actions\BaseAction;
use Exception;
use Illuminate\Support\Facades\Http;

class ManagePenpotAction extends BaseAction
{
    private string $baseUrl = 'https://design.penpot.app/api/rpc/command';

    /**
     * List projects from Penpot.
     *
     * @return array<int, array{id: string, name: string}>
     */
    public function listProjects(): array
    {
        $token = $this->getToken();
        $response = Http::withToken($token, 'Token')->post("{$this->baseUrl}/list-projects");

        if (! $response->successful()) {
            throw new Exception("Failed to fetch Penpot projects: {$response->status()}");
        }

        return $response->json();
    }

    /**
     * Get project detail from Penpot.
     *
     * @return array<string, mixed>
     */
    public function getProject(string $projectId): array
    {
        $token = $this->getToken();
        $response = Http::withToken($token, 'Token')->post("{$this->baseUrl}/get-project", ['id' => $projectId]);

        if (! $response->successful()) {
            throw new Exception("Failed to fetch project detail: {$response->status()}");
        }

        return $response->json();
    }

    private function getToken(): string
    {
        $token = config('services.penpot.token');
        if (! $token) {
            throw new Exception('PENPOT_TOKEN is missing in configuration.');
        }

        return (string) $token;
    }
}
