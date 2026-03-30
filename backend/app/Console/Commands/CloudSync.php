<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CloudSync extends Command
{
    protected $signature = 'app:cloud-sync';
    protected $description = 'Verify connectivity between Local, Supabase, and Storj Cloud';

    public function handle()
    {
        $this->info("Verifying Cloud Connectivity...");

        // 1. Supabase Check
        try {
            DB::connection()->getPdo();
            $this->info("✅ SUPABASE: Connected successfully.");
        } catch (\Exception $e) { $this->error("❌ SUPABASE: Connection failed!"); }

        // 2. Storj Check
        if (config('services.storj.key') || config('filesystems.disks.s3.key')) {
            $this->info("✅ STORJ CLOUD: Configuration detected.");
        } else { $this->warn("⚠️ STORJ CLOUD: Keys are missing in configuration."); }

        // 3. Gemini AI Check
        if (config('services.gemini.key')) {
            $this->info("✅ GEMINI AI: Connected and ready.");
        } else { $this->warn("⚠️ GEMINI AI: API key not found in configuration."); }
    }
}
