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
    // 🛡️ Skip if Supabase is not configured or user is not logged in
    if (!user || !supabase) return;

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
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
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
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
        }
      )
      // Holidays
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'holidays',
          filter: householdId ? `household_id=eq.${householdId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['holidays'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'holiday_transactions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['holidays'] });
          queryClient.invalidateQueries({ queryKey: ['holiday_transactions'] });
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
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
      // 🤖 AI Cognitive Sync (Chat & Wisdom)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_histories',
          filter: householdId ? `household_id=eq.${householdId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat_history'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financial_wisdoms',
          filter: householdId ? `household_id=eq.${householdId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['financial_wisdoms'] });
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
