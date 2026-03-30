<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;

class AssetManage extends Command
{
    protected $signature = 'app:asset-manage {action=list} {--name=} {--type=} {--value=} {--id=}';
    protected $description = 'Manage financial assets and total wealth';

    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'add': $this->addAsset(); break;
            case 'list': $this->listAssets(); break;
            case 'update': $this->updateAsset(); break;
            default: $this->error("Invalid action: $action");
        }
    }

    private function addAsset()
    {
        $name = $this->option('name');
        $type = $this->option('type');
        $value = (float) $this->option('value');

        if (!$name || !$value) {
            $this->error("Name and value are required for adding assets.");
            return;
        }

        Asset::create(['name' => $name, 'type' => $type ?? 'other', 'value' => $value]);
        $this->info("Asset '$name' added successfully!");
    }

    private function listAssets()
    {
        $assets = Asset::all();
        if ($assets->isEmpty()) {
            $this->info("No assets recorded.");
            return;
        }

        $this->info("### 💰 Wealth & Asset Overview");
        $total = 0;
        foreach ($assets as $asset) {
            $this->line("- [{$asset->id}] {$asset->name} ({$asset->type}): Rp " . number_format($asset->value, 0, ',', '.'));
            $total += $asset->value;
        }
        $this->info("----------------------------");
        $this->info("**Total Wealth:** Rp " . number_format($total, 0, ',', '.'));
    }

    private function updateAsset()
    {
        $id = $this->option('id');
        $value = (float) $this->option('value');

        if (!$id || !$value) {
            $this->error("ID and new value are required for updates.");
            return;
        }

        $asset = Asset::find($id);
        if (!$asset) { $this->error("Asset not found!"); return; }

        $oldValue = $asset->value;
        $asset->update(['value' => $value]);
        
        $diff = $value - $oldValue;
        $trend = $diff >= 0 ? "+" : "-";
        $this->info("Asset '{$asset->name}' updated! Rp " . number_format($oldValue, 0) . " -> Rp " . number_format($value, 0) . " ($trend Rp " . number_format(abs($diff), 0) . ")");
    }
}
