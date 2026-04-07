<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_active_at')->nullable()->after('updated_at');
            $table->integer('legacy_threshold_months')->default(6)->after('last_active_at');
            $table->boolean('is_legacy_triggered')->default(false)->after('legacy_threshold_months');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['last_active_at', 'legacy_threshold_months', 'is_legacy_triggered']);
        });
    }
};
