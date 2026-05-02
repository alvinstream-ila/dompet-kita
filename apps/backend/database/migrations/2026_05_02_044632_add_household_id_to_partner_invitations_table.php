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
        Schema::table('partner_invitations', function (Blueprint $table) {
            $table->uuid('household_id')->nullable()->after('inviter_id')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('partner_invitations', function (Blueprint $table) {
            $table->dropColumn('household_id');
        });
    }
};
