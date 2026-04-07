import React from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/get-query-client';
import { DashboardView } from '@/features/home';
import { getFinancialSummaryAction } from '@/features/transactions/actions/transactions';
import { getUserProfileAction } from '@/features/auth/actions/user';

/**
 * Dompet Kita - Protected Home Page (RSC)
 * 
 * This is now a Server Component that prefetches data
 * to ensure the page has information immediately on load.
 */
export default async function HomePage() {
  const queryClient = getQueryClient();

  // Prefetch critical data on the server
  // This avoids waterfalls and makes the page feel instant
  const prefetchData = async () => {
    // 1. Get user profile for settings (budget cycle, etc.)
    const user = await getUserProfileAction();
    
    // 2. Prefetch financial summary
    // We use the same query keys as the client-side hooks
    await queryClient.prefetchQuery({
      queryKey: ['financial_summary', undefined, undefined, user?.budget_cycle_start || 1],
      queryFn: () => getFinancialSummaryAction(undefined, undefined, user?.budget_cycle_start || 1),
    });

    return user;
  };

  await prefetchData();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardView />
    </HydrationBoundary>
  );
}
