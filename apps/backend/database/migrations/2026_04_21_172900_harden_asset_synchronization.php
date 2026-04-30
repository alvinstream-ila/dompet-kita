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
        // 1. Add last_synced_at to assets table
        Schema::table('assets', function (Blueprint $blueprint): void {
            $blueprint->timestamp('last_synced_at')->nullable()->after('is_market_synced');
        });

        // 2. Create asset_price_histories table for trend tracking
        Schema::create('asset_price_histories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 24, 8); // Unit price (e.g. price per 1 gram gold)
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['asset_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_price_histories');
        Schema::table('assets', function (Blueprint $blueprint): void {
            $blueprint->dropColumn('last_synced_at');
        });
    }
};
