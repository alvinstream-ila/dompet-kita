<?php

declare(strict_types=1);

namespace App\Console\Commands\System;

use App\Actions\System\ManagePenpotAction;
use Exception;
use Illuminate\Console\Command;

class PenpotManage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:penpot-manage {action=list-projects} {--projectId=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync and manage designs from Penpot App';

    /**
     * Execute the console command.
     */
    public function handle(ManagePenpotAction $action): int
    {
        try {
            $subAction = $this->argument('action');

            return match ($subAction) {
                'list-projects' => $this->handleListProjects($action),
                'get-project' => $this->handleGetProject($action),
                default => $this->handleInvalidAction((string) $subAction),
            };
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }

    private function handleListProjects(ManagePenpotAction $action): int
    {
        $this->info('### 🎨 Penpot Projects');
        $projects = $action->listProjects();

        foreach ($projects as $project) {
            $this->line("- [{$project['id']}] {$project['name']}");
        }

        return 0;
    }

    private function handleGetProject(ManagePenpotAction $action): int
    {
        $projectId = $this->option('projectId');
        if (! $projectId) {
            $this->error('projectId option is required!');

            return 1;
        }

        $this->info('### 🎨 Fetching Penpot Project File Detail');
        $project = $action->getProject((string) $projectId);

        $this->line((string) json_encode($project, JSON_PRETTY_PRINT));

        return 0;
    }

    private function handleInvalidAction(string $action): int
    {
        $this->error("Action '{$action}' not implemented.");

        return 1;
    }
}
