<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class PenpotManage extends Command
{
    protected $signature = 'app:penpot-manage {action=list-projects} {--projectId=}';
    protected $description = 'Sync and manage designs from Penpot App';

    private string $baseUrl = "https://design.penpot.app/api/rpc/command";

    public function handle()
    {
        $action = $this->argument('action');
        $token = config('services.penpot.token') ?? env('PENPOT_TOKEN');

        if (!$token) {
            $this->error("PENPOT_TOKEN is missing in .env!");
            return;
        }

        switch ($action) {
            case 'list-projects':
                $this->listProjects($token);
                break;
            case 'get-project':
                if (!$this->option('projectId')) {
                    $this->error("projectId option is required!");
                    return;
                }
                $this->getProjectFile($token, $this->option('projectId'));
                break;
            default:
                $this->error("Action '$action' not implemented.");
        }
    }

    private function listProjects($token)
    {
        $this->info("### 🎨 Penpot Projects");
        $response = Http::withToken($token, 'Token')->post("$this->baseUrl/list-projects");

        if ($response->successful()) {
            $projects = $response->json();
            foreach ($projects as $project) {
                $this->line("- [{$project['id']}] {$project['name']}");
            }
        } else {
            $this->error("Failed to fetch Penpot projects: " . $response->status());
        }
    }

    private function getProjectFile($token, $projectId)
    {
        $this->info("### 🎨 Fetching Penpot Project File Detail");
        $response = Http::withToken($token, 'Token')->post("$this->baseUrl/get-project", ['id' => $projectId]);

        if ($response->successful()) {
            $this->line(json_encode($response->json(), JSON_PRETTY_PRINT));
        } else {
            $this->error("Failed to fetch project detail: " . $response->status());
        }
    }
}
