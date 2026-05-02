<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Sets REPLICA IDENTITY FULL for remaining tables to ensure "Instant" sync works.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        $tables = [
            'chat_histories',
            'financial_wisdoms',
            'holidays',
            'wealth_histories',
            'transaction_insights',
            'scheduled_transactions',
            'holiday_transactions',
        ];

        foreach ($tables as $table) {
            try {
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
            'chat_histories',
            'financial_wisdoms',
            'holidays',
            'wealth_histories',
            'transaction_insights',
            'scheduled_transactions',
            'holiday_transactions',
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
