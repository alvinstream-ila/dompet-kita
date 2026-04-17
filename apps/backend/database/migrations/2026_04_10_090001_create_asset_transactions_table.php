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
        Schema::create('asset_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('asset_id')->constrained()->onDelete('cascade');
            $table->foreignId('source_asset_id')->nullable()->constrained('assets')->onDelete('set null');
            $table->decimal('amount', 20, 2);
            $table->string('type'); // funding, withdrawal, adjustment
            $table->string('description')->nullable();
            $table->timestamp('transaction_date')->useCurrent();
            $table->timestamps();

            $table->index(['user_id', 'asset_id']);
        });

        // Enable RLS for Supabase (Postgres ONLY)
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE asset_transactions ENABLE ROW LEVEL SECURITY;');
            DB::statement('ALTER TABLE asset_transactions FORCE ROW LEVEL SECURITY;');

            // Add RLS Policies
            DB::statement('
                CREATE POLICY "Users can view their own asset transactions"
                ON public.asset_transactions
                FOR SELECT
                USING (user_id::text = auth.uid()::text);
            ');

            DB::statement('
                CREATE POLICY "Users can insert their own asset transactions"
                ON public.asset_transactions
                FOR INSERT
                WITH CHECK (user_id::text = auth.uid()::text);
            ');

            DB::statement('
                CREATE POLICY "Users can update their own asset transactions"
                ON public.asset_transactions
                FOR UPDATE
                USING (user_id::text = auth.uid()::text);
            ');

            DB::statement('
                CREATE POLICY "Users can delete their own asset transactions"
                ON public.asset_transactions
                FOR DELETE
                USING (user_id::text = auth.uid()::text);
            ');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_transactions');
    }
};
