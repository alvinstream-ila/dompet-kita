-- 🛡️ Dompet Kita: Postgres Row Level Security (RLS) Policies
-- Jalankan script ini di SQL Editor Supabase untuk proteksi maksimal di level database.

-- 1. Enable RLS on all critical tables (Jika belum via migration)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "loans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "goals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "holidays" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wealth_histories" ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for 'users' table
-- User hanya bisa melihat datanya sendiri
CREATE POLICY "Users can only view their own profile" ON "users"
FOR SELECT USING (auth.uid() = id);

-- 3. Create Policies for 'transactions' table
CREATE POLICY "Users can manage their own transactions" ON "transactions"
FOR ALL USING (auth.uid() = user_id);

-- 4. Create Policies for 'assets' table
CREATE POLICY "Users can manage their own assets" ON "assets"
FOR ALL USING (auth.uid() = user_id);

-- 5. Create Policies for 'loans' table
CREATE POLICY "Users can manage their own loans" ON "loans"
FOR ALL USING (auth.uid() = user_id);

-- 6. Create Policies for 'goals' table
CREATE POLICY "Users can manage their own goals" ON "goals"
FOR ALL USING (auth.uid() = user_id);

-- 7. Create Policies for 'holidays' table
CREATE POLICY "Users can manage their own holidays" ON "holidays"
FOR ALL USING (auth.uid() = user_id);

-- 8. Create Policies for 'wealth_histories' table
CREATE POLICY "Users can view their own wealth history" ON "wealth_histories"
FOR SELECT USING (auth.uid() = user_id);

-- 9. Create Policies for 'budgets' table
CREATE POLICY "Users can manage their own budgets" ON "budgets"
FOR ALL USING (auth.uid() = user_id);

-- 💡 CATATAN: 
-- Kebijakan di atas menggunakan `auth.uid()`. 
-- Pastikan tabel `users.id` di database kamu sinkron dengan `auth.users.id` di Supabase Auth.
-- Jika menggunakan Laravel Sanctum sebagai primary auth, RLS ini berperan sebagai Secondary Defense 
-- jika ada kebocoran Service Role Key atau akses langsung ke DB.
