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
        // Populate household_id from users table if missing
        DB::statement('UPDATE wealth_histories SET household_id = users.household_id FROM users WHERE wealth_histories.user_id = users.id AND wealth_histories.household_id IS NULL');

        Schema::table('wealth_histories', function (Blueprint $table) {
            // Drop old unique constraint
            $table->dropUnique(['user_id', 'month', 'year']);

            // Add new unique constraint for household
            $table->unique(['household_id', 'month', 'year']);

            // Make household_id non-nullable
            $table->uuid('household_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wealth_histories', function (Blueprint $table) {
            $table->dropUnique(['household_id', 'month', 'year']);
            $table->unique(['user_id', 'month', 'year']);
            $table->uuid('household_id')->nullable(true)->change();
        });
    }
};
