<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaction_insights', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // leak, optimization, trend, achievement
            $table->string('title');
            $table->text('content');
            $table->decimal('impact_value', 15, 2)->default(0);
            $table->string('status')->default('new'); // new, read, archived
            $table->string('action_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // Enable RLS for Security Gate 100/100 compliance
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE transaction_insights ENABLE ROW LEVEL SECURITY');
            DB::statement('DROP POLICY IF EXISTS "Users can only access their own insights" ON transaction_insights');
            DB::statement('CREATE POLICY "Users can only access their own insights" ON transaction_insights 
                USING (user_id::text = current_setting(\'app.current_user_id\', true))');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_insights');
    }
};
