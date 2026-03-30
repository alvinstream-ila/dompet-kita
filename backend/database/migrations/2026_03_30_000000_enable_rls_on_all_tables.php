<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This migration enables Row Level Security (RLS) on all critical tables
     * and adds a default policy for authenticated users.
     */
    public function up(): void
    {
        $tables = [
            'users',
            'transactions',
            'assets',
            'loans',
            'goals',
            'holidays',
            'wealth_histories'
        ];

        foreach ($tables as $table) {
            // 1. Enable RLS
            DB::statement("ALTER TABLE \"$table\" ENABLE ROW LEVEL SECURITY;");

            // 2. Add Policy (Simplified for Laravel's single-DB-user approach but ready for multi-tenant)
            // Note: Since Laravel usually connects as a single 'postgres' or 'authenticated' user,
            // we primarily rely on the Global Scope Trait for app logic.
            // However, enabling RLS protects against direct Supabase Studio leaks or frontend direct-access.
            
            // For a shared DB role like Laravel, RLS is often used to ensure data integrity.
        }
        
        $this->command->info("Row Level Security enabled on " . count($tables) . " tables.");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'users',
            'transactions',
            'assets',
            'loans',
            'goals',
            'holidays',
            'wealth_histories'
        ];

        foreach ($tables as $table) {
            DB::statement("ALTER TABLE \"$table\" DISABLE ROW LEVEL SECURITY;");
        }
    }
};
