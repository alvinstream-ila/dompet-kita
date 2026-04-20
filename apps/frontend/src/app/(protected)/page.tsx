import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
/**
 * Dompet Kita - Protected Home Page (RSC)
 *
 * This is now a Server Component that prefetches data
 * to ensure the page has information immediately on load.
 */
import { Suspense } from 'react';
import { getUserProfileAction } from '@/features/auth/actions/user';
import { DashboardView } from '@/features/home';
import { DashboardSkeletons } from '@/features/home/components/DashboardSkeletons';
import { getFinancialSummaryAction } from '@/features/transactions/actions/transactions';
import { getQueryClient } from '@/lib/get-query-client';

import { cookies } from 'next/headers';

export default async function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeletons />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  // Force dynamic rendering and check session early to satisfy Next.js 15 prerenderer
  await cookies();

  const queryClient = getQueryClient();

  // Prefetch critical data on the server in parallel to eliminate waterfalls
  const prefetchData = async () => {
    // We launch the user check first as it's critical for the budget cycle logic
    const user = await getUserProfileAction();

    // Now prefetch everything else that doesn't strictly depend on waiting for others
    // although financial_summary needs the user's budget cycle, we have it now
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: [
          'financial_summary',
          undefined,
          undefined,
          user?.budget_cycle_start || 1,
        ],
        queryFn: () =>
          getFinancialSummaryAction(
            undefined,
            undefined,
            user?.budget_cycle_start || 1
          ),
      }),
      // Add other critical dashboard queries here if needed in parallel
    ]);

    return user;
  };

  await prefetchData();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardView />
    </HydrationBoundary>
  );
}
