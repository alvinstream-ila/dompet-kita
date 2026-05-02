<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Sets REPLICA IDENTITY FULL to ensure DELETE events include all columns.
     * This is required for Supabase Realtime filters (like household_id) to work on DELETE.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        $tables = [
            'transactions',
            'assets',
            'loans',
            'goals',
            'households',
            'asset_transactions',
            'goal_transactions',
        ];

        foreach ($tables as $table) {
            try {
                // Set replica identity to FULL so the WAL includes all columns for DELETE/UPDATE.
                DB::statement("ALTER TABLE {$table} REPLICA IDENTITY FULL");
            } catch (Exception $e) {
                Log::warning("Could not set REPLICA IDENTITY FULL for [{$table}]: ".$e->getMessage());
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        $tables = [
            'transactions',
            'assets',
            'loans',
            'goals',
            'households',
            'asset_transactions',
            'goal_transactions',
        ];

        foreach ($tables as $table) {
            try {
                DB::statement("ALTER TABLE {$table} REPLICA IDENTITY DEFAULT");
            } catch (Exception $e) {
                Log::warning("Could not reset REPLICA IDENTITY for [{$table}]: ".$e->getMessage());
            }
        }
    }
};
