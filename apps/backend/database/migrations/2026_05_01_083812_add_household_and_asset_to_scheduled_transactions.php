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
        Schema::table('scheduled_transactions', function (Blueprint $table): void {
            $table->foreignId('asset_id')->nullable()->after('amount')->constrained()->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scheduled_transactions', function (Blueprint $table): void {
            $table->dropForeign(['asset_id']);
            $table->dropColumn('asset_id');
        });
    }
};
