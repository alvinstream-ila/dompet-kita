<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_price_histories', function (Blueprint $table) {
            $table->foreignUuid('household_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        Schema::table('firewall_logs', function (Blueprint $table) {
            $table->foreignUuid('household_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('asset_price_histories', function (Blueprint $table) {
            $table->dropForeign(['household_id']);
            $table->dropColumn('household_id');
        });

        Schema::table('firewall_logs', function (Blueprint $table) {
            $table->dropForeign(['household_id']);
            $table->dropColumn('household_id');
        });
    }
};
