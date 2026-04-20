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
        // 1. Add Missing Indexes to speed up Foreign Key lookups and joins
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('user_id');
            // Adding a composite index for Dashboard summary fetching speed
            $table->index(['user_id', 'date']);
        });
        Schema::table('assets', function (Blueprint $table) {
            $table->index('user_id');
        });
        Schema::table('goals', function (Blueprint $table) {
            $table->index('user_id');
        });
        Schema::table('loans', function (Blueprint $table) {
            $table->index('user_id');
        });
        Schema::table('asset_transactions', function (Blueprint $table) {
            $table->index('asset_id');
            $table->index('source_asset_id');
        });
        Schema::table('goal_transactions', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('goal_id');
            $table->index('asset_id');
        });
        Schema::table('holiday_transactions', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('holiday_id');
            $table->index('asset_id');
        });
        Schema::table('chat_histories', function (Blueprint $table) {
            $table->index('user_id');
        });
        Schema::table('legacy_vault_reports', function (Blueprint $table) {
            $table->index('user_id');
        });
        Schema::table('login_histories', function (Blueprint $table) {
            $table->index('user_id');
        });
        Schema::table('transaction_insights', function (Blueprint $table) {
            $table->index('user_id');
        });
        Schema::table('scheduled_transactions', function (Blueprint $table) {
            $table->index('user_id');
        });
        Schema::table('partner_invitations', function (Blueprint $table) {
            $table->index('inviter_id');
        });

        // 2. Fix Auth RLS Initplan Caching
        // Wrap auth.uid() inside a subselect: (select auth.uid()) so PostgREST avoids eval-ing it for every row (Seq Scan bottleneck)
        $policiesToUpdateWithCheck = [
            'transactions' => 'user_exclusive_access',
            'assets' => 'user_exclusive_access',
            'goals' => 'user_exclusive_access',
            'loans' => 'user_exclusive_access',
            'wealth_histories' => 'user_exclusive_access',
        ];

        $policiesToCreateWithCheck = [
            'goal_transactions' => 'user_exclusive_access',
            'legacy_vault_reports' => 'user_exclusive_access',
        ];

        foreach ($policiesToUpdateWithCheck as $table => $policy) {
            DB::statement("ALTER POLICY \"{$policy}\" ON {$table} USING (((user_id)::text = ((select auth.uid()))::text)) WITH CHECK (((user_id)::text = ((select auth.uid()))::text))");
        }

        foreach ($policiesToCreateWithCheck as $table => $policy) {
            DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
            DB::statement("DROP POLICY IF EXISTS \"{$policy}\" ON {$table}");
            DB::statement("CREATE POLICY \"{$policy}\" ON {$table} USING (((user_id)::text = ((select auth.uid()))::text)) WITH CHECK (((user_id)::text = ((select auth.uid()))::text))");
        }

        // Special cases that don't have WITH CHECK or use varying columns
        DB::statement('ALTER POLICY "user_exclusive_access" ON chat_histories USING (((user_id)::text = ((select auth.uid()))::text))');
        DB::statement('ALTER POLICY "user_exclusive_access" ON login_histories USING (((user_id)::text = ((select auth.uid()))::text))');
        DB::statement('ALTER POLICY "user_exclusive_access" ON financial_wisdoms USING (((user_id)::text = ((select auth.uid()))::text))');
        DB::statement('ALTER POLICY "user_exclusive_access" ON activity_log USING (((causer_id)::text = ((select auth.uid()))::text))');

        DB::statement('ALTER POLICY "users_self_access" ON users USING ((((select auth.uid()))::text = (id)::text))');

        DB::statement('ALTER TABLE partner_invitations ENABLE ROW LEVEL SECURITY');
        DB::statement('DROP POLICY IF EXISTS "inviter_exclusive_access" ON partner_invitations');
        DB::statement('CREATE POLICY "inviter_exclusive_access" ON partner_invitations USING (((inviter_id)::text = ((select auth.uid()))::text)) WITH CHECK (((inviter_id)::text = ((select auth.uid()))::text))');
        DB::statement('ALTER POLICY "Users can manage their own budgets" ON budgets USING ((((select auth.uid()))::text = (user_id)::text))');
        DB::statement('ALTER POLICY "holiday_transactions_isolation_policy" ON holiday_transactions USING (((user_id)::text = ((select auth.uid()))::text)) WITH CHECK (((user_id)::text = ((select auth.uid()))::text))');

        DB::statement("ALTER POLICY \"Users can only access their own insights\" ON transaction_insights USING (((user_id)::text = (select current_setting('app.current_user_id'::text, true))))");
        DB::statement("ALTER POLICY \"user_isolation_policy\" ON scheduled_transactions USING ((user_id = ((select current_setting('app.current_user_id'::text)))::bigint))");

        DB::statement('ALTER POLICY "Users can view their own asset transactions" ON asset_transactions USING (((user_id)::text = ((select auth.uid()))::text))');
        DB::statement('ALTER POLICY "Users can update their own asset transactions" ON asset_transactions USING (((user_id)::text = ((select auth.uid()))::text))');
        DB::statement('ALTER POLICY "Users can delete their own asset transactions" ON asset_transactions USING (((user_id)::text = ((select auth.uid()))::text))');
        DB::statement('ALTER POLICY "Users can insert their own asset transactions" ON asset_transactions WITH CHECK (((user_id)::text = ((select auth.uid()))::text))');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reversals would drop indices and reset policies to original forms
    }
};
