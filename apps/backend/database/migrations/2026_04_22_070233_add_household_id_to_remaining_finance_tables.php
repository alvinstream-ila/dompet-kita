<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Completing the "Sovereign Household" architecture by adding household_id to all remaining finance tables.
     */
    public function up(): void
    {
        $tables = [
            'budgets',
            'wealth_histories',
            'transaction_insights',
            'scheduled_transactions',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                    if (! Schema::hasColumn($tableName, 'household_id')) {
                        $table->foreignUuid('household_id')
                            ->nullable()
                            ->after('user_id')
                            ->constrained('households')
                            ->onDelete('cascade');
                    }
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
            'budgets',
            'wealth_histories',
            'transaction_insights',
            'scheduled_transactions',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table): void {
                    $table->dropForeign(['household_id']);
                    $table->dropColumn('household_id');
                });
            }
        }
    }
};
