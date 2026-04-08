<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\Asset\CreateAssetAction;
use App\Actions\Finance\Asset\GetAssetSummaryAction;
use App\Actions\Finance\Asset\UpdateAssetAction;
use App\Models\Asset;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class AssetManage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:asset-manage {action=list} {--name=} {--type=} {--value=} {--id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage financial assets and total wealth';

    /**
     * Execute the console command.
     */
    public function handle(
        CreateAssetAction $createAssetAction,
        UpdateAssetAction $updateAssetAction,
        GetAssetSummaryAction $getAssetSummaryAction
    ): int {
        try {
            $action = $this->argument('action');
            $defaultUser = User::find(1); // Default for CLI

            if (! $defaultUser) {
                $this->error('Primary user (ID 1) not found.');

                return 1;
            }

            return match ($action) {
                'add' => $this->handleAdd($createAssetAction, $defaultUser),
                'list' => $this->handleList($getAssetSummaryAction, $defaultUser),
                'update' => $this->handleUpdate($updateAssetAction, $defaultUser),
                default => $this->handleInvalidAction($action),
            };
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }

    private function handleAdd(CreateAssetAction $action, User $user): int
    {
        $name = $this->option('name');
        $type = $this->option('type') ?? 'other';
        $value = $this->option('value');

        if (! $name || $value === null) {
            $this->error('Name and value are required for adding assets.');

            return 1;
        }

        $action->execute($user, [
            'name' => $name,
            'type' => $type,
            'value' => (float) $value,
        ]);

        $this->info("✅ Asset '{$name}' added successfully!");

        return 0;
    }

    private function handleList(GetAssetSummaryAction $action, User $user): int
    {
        $summary = $action->execute($user);
        $assets = $summary['assets'];

        if ($assets->isEmpty()) {
            $this->info('No assets recorded.');

            return 0;
        }

        $this->info('### 💰 Wealth & Asset Overview');
        foreach ($assets as $asset) {
            $this->line("- [{$asset->id}] {$asset->name} ({$asset->type->value}): Rp ".number_format($asset->value, 0, ',', '.'));
        }
        $this->info('----------------------------');
        $this->info('**Total Wealth:** Rp '.number_format($summary['total_wealth'], 0, ',', '.'));

        return 0;
    }

    private function handleUpdate(UpdateAssetAction $action, User $user): int
    {
        $id = $this->option('id');
        $value = $this->option('value');

        if (! $id || $value === null) {
            $this->error('ID and new value are required for updates.');

            return 1;
        }

        $asset = Asset::find($id);
        if (! $asset) {
            $this->error("Asset with ID {$id} not found.");

            return 1;
        }

        $oldValue = $asset->value;
        $action->execute($user, $asset, ['value' => (float) $value]);

        $this->info("✅ Asset '{$asset->name}' updated!");
        $this->line('Rp '.number_format($oldValue, 0).' -> Rp '.number_format($asset->value, 0));

        return 0;
    }

    private function handleInvalidAction(string $action): int
    {
        $this->error("Invalid action: {$action}");

        return 1;
    }
}
