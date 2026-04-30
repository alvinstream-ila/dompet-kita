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
        Schema::table('users', function (Blueprint $table): void {
            $table->integer('budget_cycle_start')->default(1);
            $table->boolean('is_privacy_mode')->default(false);
            $table->boolean('is_eco_mode')->default(false);
            $table->string('currency_format')->default('IDR');
            $table->decimal('monthly_budget_limit', 15, 2)->default(5000000);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'budget_cycle_start',
                'is_privacy_mode',
                'is_eco_mode',
                'currency_format',
                'monthly_budget_limit',
            ]);
        });
    }
};
