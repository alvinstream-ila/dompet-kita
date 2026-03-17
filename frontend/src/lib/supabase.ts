import { createClient } from '@supabase/supabase-js';

// Dompet Kita - Supabase Client
// Note: Currently being migrated to Laravel. Frontend uses this for real-time
// features and legacy data fetching until standard API migration is complete.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Check your .env.local file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
