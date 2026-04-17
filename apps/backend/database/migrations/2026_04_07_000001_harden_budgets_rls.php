<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // 🛡️ Enable RLS (Row Level Security) on the budgets table
        // This is the cleanest and most robust way to manage security in a Supabase + Laravel ecosystem.
        DB::statement('ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;');

        // Use high-performance (SELECT auth.uid()) pattern for Postgres optimizer
        DB::statement('
            CREATE POLICY "Users can manage their own budgets"
            ON budgets
            FOR ALL
            USING ((auth.uid())::text = (user_id)::text);
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('DROP POLICY IF EXISTS "Users can manage their own budgets" ON budgets;');
        DB::statement('ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;');
    }
};
