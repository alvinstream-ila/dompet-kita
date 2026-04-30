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
            $table->string('tax_status')->default('TK/0')->after('partner_id');
            $table->integer('dependents_count')->default(0)->after('tax_status');
            $table->string('industry_sector')->nullable()->after('dependents_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['tax_status', 'dependents_count', 'industry_sector']);
        });
    }
};
