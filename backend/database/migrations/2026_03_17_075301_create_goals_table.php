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
        if (!Schema::hasTable('goals')) {
            Schema::create('goals', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->timestampTz('created_at')->useCurrent();
                $table->text('name');
                $table->double('target_amount');
                $table->double('current_amount')->default(0);
                $table->timestampTz('deadline')->nullable();
                $table->text('category')->nullable();
                $table->text('icon')->nullable();
                $table->text('status')->default('active'); // active | completed
                $table->uuid('user_id')->nullable();
                $table->index('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
