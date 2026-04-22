'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * 📡 useRealtimeSync
 *
 * The "Sovereign Sync" engine. Listens for database changes in Supabase
 * and automatically invalidates React Query caches for all open sessions.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    // If no user or no household, we can't filter the sync.
    // However, Supabase RLS will still protect the data.
    if (!user) return;

    const householdId = user.household_id;

    console.log('🛡️ Starting Sovereign Sync for Household:', householdId);

    // 1. Unified Sovereign Sync Channel
    const channel = supabase
      .channel('sovereign_sync_master')
      // Transactions & Summaries
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: householdId ? `household_id=eq.${householdId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
          queryClient.invalidateQueries({ queryKey: ['ai_insights'] });
          queryClient.invalidateQueries({ queryKey: ['assets'] }); // Assets often change with transactions
        }
      )
      // Assets & Wealth
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
          filter: householdId ? `household_id=eq.${householdId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['assets'] });
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
          queryClient.invalidateQueries({ queryKey: ['wealth_history'] });
        }
      )
      // Asset Transactions (Specific logs)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'asset_transactions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['asset_transactions'] });
          queryClient.invalidateQueries({ queryKey: ['assets'] });
        }
      )
      // Loans
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loans',
          filter: householdId ? `household_id=eq.${householdId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['loans'] });
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
        }
      )
      // Goals & Milestones
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: householdId ? `household_id=eq.${householdId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['goals'] });
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goal_transactions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['goals'] });
          queryClient.invalidateQueries({ queryKey: ['goal_transactions'] });
        }
      )
      // Household changes (Members, Settings)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'households',
          filter: householdId ? `id=eq.${householdId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['user'] });
          queryClient.invalidateQueries({ queryKey: ['household'] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🚀 Sovereign Sync: Online');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
