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
            $table->string('social_id')->nullable()->after('id');
            $table->string('social_type')->nullable()->after('social_id');
            $table->string('password')->nullable()->change(); // Password can be null for social login
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['social_id', 'social_type']);
            $table->string('password')->nullable(false)->change();
        });
    }
};
