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

        // Mock auth schema and uid() function if it doesn't exist (e.g., for local testing / CI environments)
        $authSchemaExists = DB::select("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth'");
        if (empty($authSchemaExists)) {
            DB::statement("CREATE SCHEMA IF NOT EXISTS auth;");
            DB::statement("
                CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
                BEGIN
                    RETURN NULL;
                END;
                $$ LANGUAGE plpgsql;
            ");
        }
        $newTables = [
            'chat_histories' => 'user_id',
            'financial_wisdoms' => 'user_id',
            'login_histories' => 'user_id',
            'activity_log' => 'causer_id',
        ];

        foreach ($newTables as $table => $userColumn) {
            // 1. Enable RLS
            DB::statement("ALTER TABLE \"$table\" ENABLE ROW LEVEL SECURITY;");

            // 2. Ensure RLS is forced even for the table owner (Force RLS)
            DB::statement("ALTER TABLE \"$table\" FORCE ROW LEVEL SECURITY;");

            // 3. Create Default Auth Policy
            // We ensure that only authenticated requests (via JWT) can see their own data
            // based on the global user context or session user.
            // Note: In Supabase, auth.uid() is the standard.
            DB::statement("DROP POLICY IF EXISTS \"user_exclusive_access\" ON \"$table\";");
            DB::statement("CREATE POLICY \"user_exclusive_access\" ON \"$table\" FOR ALL USING ($userColumn::text = auth.uid()::text);");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }
        $newTables = [
            'chat_histories',
            'financial_wisdoms',
            'login_histories',
            'activity_log',
        ];

        foreach ($newTables as $table) {
            DB::statement("DROP POLICY IF EXISTS \"user_exclusive_access\" ON \"$table\";");
            DB::statement("ALTER TABLE \"$table\" DISABLE ROW LEVEL SECURITY;");
        }
    }
};
