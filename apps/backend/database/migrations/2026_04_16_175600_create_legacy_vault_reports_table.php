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
        // Add grace period tracking to users table
        Schema::table('users', function (Blueprint $table): void {
            $table->timestamp('legacy_grace_start_at')->nullable()->after('is_legacy_triggered');
            $table->string('legacy_partner_name')->nullable()->after('partner_id');
            $table->string('legacy_partner_email')->nullable()->after('legacy_partner_name');
        });

        // Create the legacy vault reports table
        Schema::create('legacy_vault_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('filename');
            $table->string('storage_path');
            $table->string('disk')->default('storj');
            $table->json('summary_data')->nullable(); // Financial summary snapshot
            $table->boolean('is_claimed')->default(false);
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('purge_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('legacy_vault_reports');
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['legacy_grace_start_at', 'legacy_partner_name', 'legacy_partner_email']);
        });
    }
};
