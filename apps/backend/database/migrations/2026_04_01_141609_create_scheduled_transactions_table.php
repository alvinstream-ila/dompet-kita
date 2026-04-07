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
        Schema::create('scheduled_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('description');
            $table->decimal('amount', 15, 2);
            $table->string('type'); // expense / income
            $table->string('category')->default('General');
            $table->string('recurrence'); // daily, weekly, monthly, yearly
            $table->date('next_due_date');
            $table->string('status')->default('active'); // active, paused, finished
            $table->boolean('is_auto_execute')->default(false); // CFO AI behavior
            $table->timestamp('last_executed_at')->nullable();
            $table->timestamps();
        });

        // Enable RLS for Security Guard v6.3 compliance
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE scheduled_transactions ENABLE ROW LEVEL SECURITY');
            DB::statement('CREATE POLICY user_isolation_policy ON scheduled_transactions USING (user_id = current_setting(\'app.current_user_id\')::bigint)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_transactions');
    }
};
