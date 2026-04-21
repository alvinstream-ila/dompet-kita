<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Moving from simple strings to normalized categories for better analytics and data integrity.
     */
    public function up(): void
    {
        // 1. Create Categories Table
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('household_id')->nullable()->constrained('households')->onDelete('cascade');
            $table->string('name');
            $table->string('icon')->nullable();
            $table->string('type'); // income | expense
            $table->string('color')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['household_id', 'name', 'type']);
        });

        // 2. Update Transactions Table
        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'category_id')) {
                $table->foreignId('category_id')->nullable()->after('amount')->constrained('categories')->onDelete('set null');
            }
        });

        // 3. Update Scheduled Transactions if they exist
        if (Schema::hasTable('scheduled_transactions')) {
            Schema::table('scheduled_transactions', function (Blueprint $table) {
                if (!Schema::hasColumn('scheduled_transactions', 'category_id')) {
                    $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('scheduled_transactions')) {
            Schema::table('scheduled_transactions', function (Blueprint $table) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            });
        }

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });

        Schema::dropIfExists('categories');
    }
};
