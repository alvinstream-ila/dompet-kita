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
        // 1. Add currency to assets
        Schema::table('assets', function (Blueprint $table) {
            if (! Schema::hasColumn('assets', 'currency')) {
                $table->string('currency', 3)->default('IDR')->after('type');
            }
        });

        // 2. Harden wealth_histories total_value (fix mismatch)
        Schema::table('wealth_histories', function (Blueprint $table) {
            // Using decimal for precision and consistency with model casting
            // We use 20,4 to support large wealth values with precision
            $table->decimal('total_value', 20, 4)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn('currency');
        });

        Schema::table('wealth_histories', function (Blueprint $table) {
            $table->bigInteger('total_value')->change();
        });
    }
};
