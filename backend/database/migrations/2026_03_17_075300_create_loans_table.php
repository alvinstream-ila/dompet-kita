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
        if (!Schema::hasTable('loans')) {
            Schema::create('loans', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->timestampTz('created_at')->useCurrent();
                $table->text('type'); // utang | piutang
                $table->double('amount');
                $table->double('remaining_amount');
                $table->text('description')->nullable();
                $table->text('contact_name');
                $table->timestampTz('due_date')->nullable();
                $table->text('status')->default('active'); // active | paid
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
        Schema::dropIfExists('loans');
    }
};
