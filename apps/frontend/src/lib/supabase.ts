import { type SupabaseClient, createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    'Supabase credentials missing. Real-time sync will be disabled.'
  );
}

/**
 * 🛡️ Sovereign Supabase Client
 * Used for Real-time synchronization and high-performance Postgres listeners.
 *
 * ⚠️ This can be null if env vars are not configured (e.g. during SSR prerender
 * or CI builds). Always null-check before calling methods:
 *   if (supabase) { supabase.channel(...) }
 *   or use the isSupabaseReady() type guard below.
 */
export const supabase: SupabaseClient | null =
  isConfigured && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

/** Type-guard helper: use before calling any Supabase methods. */
export const isSupabaseReady = (
  client: SupabaseClient | null
): client is SupabaseClient => client !== null;
