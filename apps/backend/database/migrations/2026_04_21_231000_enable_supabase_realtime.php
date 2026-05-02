<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Use SQL to enable Supabase Realtime for the core financial publication.
     */
    public function up(): void
    {
        // Skip if running on SQLite (Testing/Local)
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Supabase uses 'supabase_realtime' as the default publication for their Listeners.
        // We add our core tables to this publication so any change triggers a WS event.

        $tables = [
            'transactions',
            'assets',
            'loans',
            'goals',
            'holidays',
            'households',
            'asset_transactions',
            'goal_transactions',
            'holiday_transactions',
        ];

        foreach ($tables as $table) {
            // We use DB::statement because this is specific to PostgreSQL (Supabase)
            // and allows the 'auto-refresh' feature to work globally.
            try {
                DB::statement("ALTER PUBLICATION supabase_realtime ADD TABLE {$table}");
            } catch (Exception $e) {
                // If it already exists or publication is missing, we catch it
                // to avoid blocking the deployment.
                Log::warning("Could not add table [{$table}] to supabase_realtime publication: ".$e->getMessage());
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
            'holidays',
            'households',
            'asset_transactions',
            'goal_transactions',
            'holiday_transactions',
        ];

        foreach ($tables as $table) {
            try {
                DB::statement("ALTER PUBLICATION supabase_realtime DROP TABLE {$table}");
            } catch (Exception $e) {
                Log::warning("Could not drop table [{$table}] from supabase_realtime publication: ".$e->getMessage());
            }
        }
    }
};
