<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Enforcing Row Level Security for Dompet Kita Sentient Core v6.3 (Supabase Integration).
     */
    public function up(): void
    {
        // 🧪 Robust Check: Ensure we're truly on Postgres before attempting RLS (Prevents SQLite test failures)
        try {
            $isPostgres = DB::getDriverName() === 'pgsql';
            if (! $isPostgres) {
                return;
            }

            // Final verify
            $result = (array) DB::selectOne('SELECT version()');
            $version = $result['version'] ?? '';
            if (! str_contains(strtolower((string) $version), 'postgres')) {
                return;
            }
        } catch (Exception $e) {
            return;
        }

        $coreFinanceTables = [
            'transactions' => 'user_id',
            'assets' => 'user_id',
            'loans' => 'user_id',
            'goals' => 'user_id',
            'wealth_histories' => 'user_id',
        ];

        foreach ($coreFinanceTables as $table => $userColumn) {
            // 1. Enable RLS
            $this->logInfo("Enabling RLS on \"$table\"...");
            DB::statement("ALTER TABLE \"$table\" ENABLE ROW LEVEL SECURITY;");

            // 2. Force RLS (Ensures policies apply even to table owner)
            DB::statement("ALTER TABLE \"$table\" FORCE ROW LEVEL SECURITY;");

            // 3. Drop existing if any and create strict Auth Policy (Only if auth.uid() exists - Supabase Standard)
            $authCheckArray = (array) DB::selectOne("SELECT EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'uid' AND nspname = 'auth') as exists");
            $hasAuthFunc = $authCheckArray['exists'] ?? false;

            DB::statement("DROP POLICY IF EXISTS \"user_exclusive_access\" ON \"$table\";");

            if ($hasAuthFunc) {
                DB::statement("CREATE POLICY \"user_exclusive_access\" ON \"$table\" 
                    FOR ALL 
                    USING ($userColumn::text = auth.uid()::text) 
                    WITH CHECK ($userColumn::text = auth.uid()::text);");
            } else {
                $this->logInfo("Skipping Auth Policy on \"$table\" (auth.uid not found - Local DB fallback)");
            }
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

        $coreFinanceTables = ['transactions', 'assets', 'loans', 'goals', 'wealth_histories'];

        foreach ($coreFinanceTables as $table) {
            DB::statement("DROP POLICY IF EXISTS \"user_exclusive_access\" ON \"$table\";");
            DB::statement("ALTER TABLE \"$table\" DISABLE ROW LEVEL SECURITY;");
        }
    }

    private function logInfo(string $message): void
    {
        echo "   $message\n";
    }
};
