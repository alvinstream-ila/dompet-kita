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
        Schema::create('holiday_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('holiday_id')->constrained()->cascadeOnDelete();
            $table->foreignId('asset_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['funding', 'spending']);
            $table->string('description')->nullable();
            $table->date('transaction_date');
            $table->timestamps();
        });

        // Enable RLS via direct SQL (Postgres ONLY)
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE holiday_transactions ENABLE ROW LEVEL SECURITY');
            DB::statement('ALTER TABLE holiday_transactions FORCE ROW LEVEL SECURITY');

            // Define RLS Policy (with text casting for UUID vs BIGINT comparison)
            $authCheck = DB::selectOne("SELECT EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'uid' AND nspname = 'auth') as exists");
            $hasAuthFunc = false;
            if ($authCheck) {
                // @phpstan-ignore-next-line
                $hasAuthFunc = (bool) (is_object($authCheck) ? ($authCheck->exists ?? false) : ($authCheck['exists'] ?? false));
            }

            if ($hasAuthFunc) {
                DB::statement('
                    CREATE POLICY holiday_transactions_isolation_policy ON holiday_transactions
                    FOR ALL
                    USING (user_id::text = auth.uid()::text)
                    WITH CHECK (user_id::text = auth.uid()::text)
                ');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('holiday_transactions');
    }
};
