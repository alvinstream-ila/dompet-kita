<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Completing the Household pattern for transaction sub-modules.
     */
    public function up(): void
    {
        $tables = ['goal_transactions', 'holiday_transactions'];
        
        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    if (!Schema::hasColumn($tableName, 'household_id')) {
                        $table->foreignUuid('household_id')->nullable()->constrained('households')->onDelete('cascade');
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
        $tables = ['goal_transactions', 'holiday_transactions'];
        
        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropForeign(['household_id']);
                    $table->dropColumn('household_id');
                });
            }
        }
    }
};
