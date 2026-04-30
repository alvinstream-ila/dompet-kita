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
            $table->string('full_name')->nullable()->after('name');
            $table->string('avatar_url')->nullable()->after('full_name');
            $table->string('partner_name')->nullable()->after('avatar_url');
            $table->date('anniversary_date')->nullable()->after('partner_name');
            $table->string('timezone')->default('Asia/Jakarta')->after('anniversary_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'full_name',
                'avatar_url',
                'partner_name',
                'anniversary_date',
                'timezone',
            ]);
        });
    }
};
