<?php

declare(strict_types=1);

namespace App\Actions\System;

use App\Actions\BaseAction;
use App\Exceptions\PenpotException;
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
            throw new PenpotException("Failed to fetch Penpot projects: {$response->status()}");
        }

        /** @var array<int, array{id: string, name: string}> $projects */
        $projects = $response->json() ?: [];

        return $projects;
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
            throw new PenpotException("Failed to fetch project detail: {$response->status()}");
        }

        /** @var array<string, mixed> $project */
        $project = $response->json() ?: [];

        return $project;
    }

    private function getToken(): string
    {
        $token = config('services.penpot.token');
        if (! $token) {
            throw new PenpotException('PENPOT_TOKEN is missing in configuration.');
        }

        return (string) $token;
    }
}
