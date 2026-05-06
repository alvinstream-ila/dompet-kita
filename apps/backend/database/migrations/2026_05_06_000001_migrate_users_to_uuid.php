<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::transaction(function () {
            // 1. Identify and Drop Foreign Keys and ALL Policies dynamically
            $affectedTables = [
                'users', 'transactions', 'assets', 'loans', 'goals', 'holidays',
                'wealth_histories', 'login_histories', 'activity_log', 'chat_histories',
                'financial_wisdoms', 'scheduled_transactions', 'transaction_insights',
                'budgets', 'partner_invitations', 'goal_transactions',
                'holiday_transactions', 'asset_transactions', 'legacy_vault_reports',
                'asset_price_histories', 'households',
            ];

            $tablesList = "'".implode("','", $affectedTables)."'";

            DB::statement("
                DO $$ 
                DECLARE 
                    r RECORD;
                BEGIN
                    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ($tablesList)) LOOP
                        EXECUTE 'DROP POLICY IF EXISTS \"' || r.policyname || '\" ON \"' || r.tablename || '\"';
                    END LOOP;
                END $$;
            ");

            $constraints = [
                ['table' => 'households', 'fk' => 'households_owner_id_foreign'],
                ['table' => 'transactions', 'fk' => 'transactions_user_id_foreign'],
                ['table' => 'assets', 'fk' => 'assets_user_id_foreign'],
                ['table' => 'loans', 'fk' => 'loans_user_id_foreign'],
                ['table' => 'goals', 'fk' => 'goals_user_id_foreign'],
                ['table' => 'holidays', 'fk' => 'holidays_user_id_foreign'],
                ['table' => 'wealth_histories', 'fk' => 'wealth_histories_user_id_foreign'],
                ['table' => 'login_histories', 'fk' => 'login_histories_user_id_foreign'],
                ['table' => 'chat_histories', 'fk' => 'chat_histories_user_id_foreign'],
                ['table' => 'financial_wisdoms', 'fk' => 'financial_wisdoms_user_id_foreign'],
                ['table' => 'users', 'fk' => 'users_partner_id_foreign'],
                ['table' => 'scheduled_transactions', 'fk' => 'scheduled_transactions_user_id_foreign'],
                ['table' => 'transaction_insights', 'fk' => 'transaction_insights_user_id_foreign'],
                ['table' => 'budgets', 'fk' => 'budgets_user_id_foreign'],
                ['table' => 'partner_invitations', 'fk' => 'partner_invitations_inviter_id_foreign'],
                ['table' => 'goal_transactions', 'fk' => 'goal_transactions_user_id_foreign'],
                ['table' => 'holiday_transactions', 'fk' => 'holiday_transactions_user_id_foreign'],
                ['table' => 'asset_transactions', 'fk' => 'asset_transactions_user_id_foreign'],
                ['table' => 'legacy_vault_reports', 'fk' => 'legacy_vault_reports_user_id_foreign'],
                ['table' => 'asset_price_histories', 'fk' => 'asset_price_histories_user_id_foreign'],
            ];

            foreach ($constraints as $c) {
                DB::statement("ALTER TABLE \"{$c['table']}\" DROP CONSTRAINT IF EXISTS \"{$c['fk']}\"");
            }

            // 2. Alter users.id to UUID
            // We use 'USING auth_uuid' if it exists and is filled, otherwise generate new
            DB::statement('ALTER TABLE users ALTER COLUMN id DROP DEFAULT');
            DB::statement('ALTER TABLE users ALTER COLUMN id TYPE uuid USING (COALESCE(auth_uuid, extensions.uuid_generate_v4()))');

            // 3. Alter other columns to UUID
            $uuidColumns = [
                ['table' => 'households', 'column' => 'owner_id'],
                ['table' => 'transactions', 'column' => 'user_id'],
                ['table' => 'assets', 'column' => 'user_id'],
                ['table' => 'loans', 'column' => 'user_id'],
                ['table' => 'goals', 'column' => 'user_id'],
                ['table' => 'holidays', 'column' => 'user_id'],
                ['table' => 'wealth_histories', 'column' => 'user_id'],
                ['table' => 'login_histories', 'column' => 'user_id'],
                ['table' => 'chat_histories', 'column' => 'user_id'],
                ['table' => 'financial_wisdoms', 'column' => 'user_id'],
                ['table' => 'users', 'column' => 'partner_id'],
                ['table' => 'scheduled_transactions', 'column' => 'user_id'],
                ['table' => 'transaction_insights', 'column' => 'user_id'],
                ['table' => 'budgets', 'column' => 'user_id'],
                ['table' => 'partner_invitations', 'column' => 'inviter_id'],
                ['table' => 'goal_transactions', 'column' => 'user_id'],
                ['table' => 'holiday_transactions', 'column' => 'user_id'],
                ['table' => 'asset_transactions', 'column' => 'user_id'],
                ['table' => 'legacy_vault_reports', 'column' => 'user_id'],
                ['table' => 'asset_price_histories', 'column' => 'user_id'],
                ['table' => 'personal_access_tokens', 'column' => 'tokenable_id'],
            ];

            foreach ($uuidColumns as $c) {
                // Since the DB was wiped, we don't need complicated casting, but for safety:
                DB::statement("ALTER TABLE \"{$c['table']}\" ALTER COLUMN \"{$c['column']}\" TYPE uuid USING NULL");
            }

            // 4. Re-add Foreign Keys
            foreach ($constraints as $c) {
                $targetColumn = ($c['fk'] === 'partner_invitations_inviter_id_foreign') ? 'inviter_id' : (($c['fk'] === 'households_owner_id_foreign') ? 'owner_id' : (($c['fk'] === 'users_partner_id_foreign') ? 'partner_id' : 'user_id'));

                DB::statement("ALTER TABLE \"{$c['table']}\" ADD CONSTRAINT \"{$c['fk']}\" FOREIGN KEY (\"{$targetColumn}\") REFERENCES users(id) ON DELETE CASCADE");
            }

            // 5. Update RLS Policies to use native UUID
            $rlsTables = ['transactions', 'assets', 'loans', 'goals', 'wealth_histories', 'users'];
            foreach ($rlsTables as $table) {
                $userColumn = ($table === 'users') ? 'id' : 'user_id';
                DB::statement("DROP POLICY IF EXISTS \"user_exclusive_access\" ON \"$table\"");
                DB::statement("DROP POLICY IF EXISTS \"users_self_access\" ON \"$table\"");

                $policyName = ($table === 'users') ? 'users_self_access' : 'user_exclusive_access';

                DB::statement("CREATE POLICY \"$policyName\" ON \"$table\" FOR ALL USING ($userColumn = auth.uid()) WITH CHECK ($userColumn = auth.uid())");
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a complex destructive migration, down() would be equally complex and likely unnecessary for this specific fix.
    }
};
