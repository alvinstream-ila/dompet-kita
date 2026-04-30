<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Fix Boolean Type Mismatch for PostgreSQL + pgBouncer (Supabase)
        if (config('database.default') === 'pgsql') {
            // Drop default first to avoid: "default for column cannot be cast automatically to type smallint"
            DB::statement('ALTER TABLE assets ALTER COLUMN is_market_synced DROP DEFAULT');
            DB::statement('ALTER TABLE assets ALTER COLUMN is_market_synced TYPE SMALLINT USING is_market_synced::integer');
            DB::statement('ALTER TABLE assets ALTER COLUMN is_market_synced SET DEFAULT 0');
        }

        // 2. Add Missing Column to Transactions
        Schema::table('transactions', function (Blueprint $table): void {
            if (! Schema::hasColumn('transactions', 'is_ai_generated')) {
                $table->boolean('is_ai_generated')->default(false)->after('metadata');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table): void {
            $table->dropColumn('is_ai_generated');
        });

        if (config('database.default') === 'pgsql') {
            DB::statement('ALTER TABLE assets ALTER COLUMN is_market_synced DROP DEFAULT');
            DB::statement('ALTER TABLE assets ALTER COLUMN is_market_synced TYPE BOOLEAN USING is_market_synced::boolean');
            DB::statement('ALTER TABLE assets ALTER COLUMN is_market_synced SET DEFAULT FALSE');
        }
    }
};
