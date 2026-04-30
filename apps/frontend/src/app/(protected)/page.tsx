import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from 'next/headers';
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
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  /**
   * ⚡ PREFETCH SURGE: Parallelizing all critical dashboard data.
   * We no longer wait for the user profile before starting the financial summary.
   * We fetch the user profile in parallel and use its default settings if available.
   */
  await Promise.all([
    getUserProfileAction(),
    queryClient.prefetchQuery({
      queryKey: ['financial_summary', currentMonth, currentYear],
      queryFn: async () => {
        // We fetch the user profile parallelly, so we might need to get cycleStart inside or use a default
        const profile = await getUserProfileAction();
        return getFinancialSummaryAction(
          currentMonth,
          currentYear,
          profile?.budget_cycle_start || 1
        );
      },
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardView />
    </HydrationBoundary>
  );
}
