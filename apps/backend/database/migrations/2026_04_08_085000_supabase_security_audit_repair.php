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

        // 1. Fix Mutable Search Paths for Security Functions
        DB::statement('ALTER FUNCTION public.get_laravel_user_id() SET search_path = public;');
        DB::statement('ALTER FUNCTION public.handle_new_user() SET search_path = public;');

        // 2. RLS for users Table (Self-Only Access)
        DB::statement('ALTER TABLE users ENABLE ROW LEVEL SECURITY;');
        DB::statement('ALTER TABLE users FORCE ROW LEVEL SECURITY;');
        DB::statement('DROP POLICY IF EXISTS "users_self_access" ON users;');
        DB::statement('CREATE POLICY "users_self_access" ON users FOR ALL USING (auth.uid()::text = id::text);');

        // 3. RLS for holidays Table (Authenticated Read-Only)
        DB::statement('ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;');
        DB::statement('ALTER TABLE holidays FORCE ROW LEVEL SECURITY;');
        DB::statement('DROP POLICY IF EXISTS "holidays_auth_read" ON holidays;');
        DB::statement('CREATE POLICY "holidays_auth_read" ON holidays FOR SELECT TO authenticated USING (true);');

        // 4. Explicit Deny/Lock for Internal System Tables
        $internalTables = [
            'cache',
            'cache_locks',
            'failed_jobs',
            'job_batches',
            'jobs',
            'migrations',
            'password_reset_tokens',
            'personal_access_tokens',
            'sessions'
        ];

        foreach ($internalTables as $table) {
            DB::statement("ALTER TABLE \"$table\" ENABLE ROW LEVEL SECURITY;");
            DB::statement("ALTER TABLE \"$table\" FORCE ROW LEVEL SECURITY;");
            
            // By adding a policy that always returns false for public/authenticated, 
            // we ensure the scanner is satisfied and the data is secure from API access.
            DB::statement("DROP POLICY IF EXISTS \"internal_lock\" ON \"$table\";");
            DB::statement("CREATE POLICY \"internal_lock\" ON \"$table\" FOR ALL TO authenticated, anon USING (false);");
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

        DB::statement('ALTER FUNCTION public.get_laravel_user_id() RESET search_path;');
        DB::statement('ALTER FUNCTION public.handle_new_user() RESET search_path;');

        DB::statement('DROP POLICY IF EXISTS "users_self_access" ON users;');
        DB::statement('DROP POLICY IF EXISTS "holidays_auth_read" ON holidays;');

        $internalTables = [
            'cache',
            'cache_locks',
            'failed_jobs',
            'job_batches',
            'jobs',
            'migrations',
            'password_reset_tokens',
            'personal_access_tokens',
            'sessions'
        ];

        foreach ($internalTables as $table) {
            DB::statement("DROP POLICY IF EXISTS \"internal_lock\" ON \"$table\";");
        }
    }
};
