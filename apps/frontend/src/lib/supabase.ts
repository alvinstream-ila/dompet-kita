import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing. Real-time sync will be disabled.'
  );
}

/**
 * 🛡️ Sovereign Supabase Client
 * Used for Real-time synchronization and high-performance Postgres listeners.
 */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
