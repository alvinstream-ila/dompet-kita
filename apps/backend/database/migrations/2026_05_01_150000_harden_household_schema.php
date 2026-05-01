<?php

use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Hardening the Sovereign Household schema by enforcing NOT NULL constraints
     * and ensuring data integrity across all multi-tenant tables.
     */
    public function up(): void
    {
        // 1. Ensure all users have a household_id (Self-Healing)
        $usersWithoutHousehold = User::whereNull('household_id')->get();
        foreach ($usersWithoutHousehold as $user) {
            $household = Household::create([
                'id' => (string) Str::uuid(),
                'name' => $user->name."'s Household",
                'owner_id' => $user->id,
            ]);

            $user->update(['household_id' => $household->id]);
        }

        // 2. Propagate household_id to all child records (Self-Healing)
        $tables = [
            'transactions',
            'assets',
            'loans',
            'goals',
            'holidays',
            'asset_transactions',
            'budgets',
            'wealth_histories',
            'transaction_insights',
            'scheduled_transactions',
            'holiday_transactions',
            'goal_transactions',
            'asset_price_histories',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'household_id')) {
                DB::statement("
                    UPDATE {$table}
                    SET household_id = (SELECT household_id FROM users WHERE users.id = {$table}.user_id)
                    WHERE household_id IS NULL
                ");
            }
        }

        // 3. Enforce NOT NULL constraints
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('household_id')->nullable(false)->change();
        });

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'household_id')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->uuid('household_id')->nullable(false)->change();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'transactions',
            'assets',
            'loans',
            'goals',
            'holidays',
            'asset_transactions',
            'budgets',
            'wealth_histories',
            'transaction_insights',
            'scheduled_transactions',
            'holiday_transactions',
            'goal_transactions',
            'asset_price_histories',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'household_id')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->uuid('household_id')->nullable(true)->change();
                });
            }
        }

        Schema::table('users', function (Blueprint $table) {
            $table->uuid('household_id')->nullable(true)->change();
        });
    }
};
