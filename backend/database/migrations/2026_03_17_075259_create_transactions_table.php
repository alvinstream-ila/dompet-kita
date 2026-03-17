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
        if (!Schema::hasTable('transactions')) {
            Schema::create('transactions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->timestampTz('created_at')->useCurrent();
                $table->timestampTz('date');
                $table->double('amount');
                $table->text('category');
                $table->text('sub_category')->nullable();
                $table->text('type'); // income | expense
                $table->text('description')->nullable();
                $table->text('note')->nullable();
                $table->text('receipt_url')->nullable();
                $table->uuid('user_id')->nullable();
                $table->index('user_id');
                $table->index('date');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
