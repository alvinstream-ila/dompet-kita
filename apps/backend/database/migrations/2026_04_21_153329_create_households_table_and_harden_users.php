<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Implementing the Household/Tenant Pattern for secure group sharing.
     */
    public function up(): void
    {
        // 1. Create Households Table
        Schema::create('households', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Harden Users Table
        Schema::table('users', function (Blueprint $table): void {
            // Mapping column for Supabase RLS
            if (! Schema::hasColumn('users', 'auth_uuid')) {
                $table->uuid('auth_uuid')->nullable()->unique()->after('id');
            }

            // Shared Group Identifier
            if (! Schema::hasColumn('users', 'household_id')) {
                $table->foreignUuid('household_id')->nullable()->after('auth_uuid')->constrained('households')->onDelete('set null');
            }
        });

        // 3. Add Household ID to core finance tables for efficient RLS
        $financeTables = ['transactions', 'assets', 'loans', 'goals', 'holidays', 'asset_transactions'];
        foreach ($financeTables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                    if (! Schema::hasColumn($tableName, 'household_id')) {
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
        $financeTables = ['transactions', 'assets', 'loans', 'goals', 'holidays', 'asset_transactions'];
        foreach ($financeTables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table): void {
                    $table->dropForeign(['household_id']);
                    $table->dropColumn('household_id');
                });
            }
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign(['household_id']);
            $table->dropColumn(['auth_uuid', 'household_id']);
        });

        Schema::dropIfExists('households');
    }
};
