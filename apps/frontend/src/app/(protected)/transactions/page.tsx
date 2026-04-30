import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { getUserProfileAction } from '@/features/auth/actions/user';
import { RecentTransactionsSkeleton } from '@/features/home/components/DashboardSkeletons';
import { TransactionsView } from '@/features/transactions';
import { getQueryClient } from '@/lib/get-query-client';
import { serverApi } from '@/lib/server-api';

export default async function TransactionsPage() {
  return (
    <Suspense fallback={<RecentTransactionsSkeleton />}>
      <TransactionsContent />
    </Suspense>
  );
}

async function TransactionsContent() {
  // Force dynamic rendering and check session early to satisfy Next.js 15 prerenderer
  await cookies();

  const queryClient = getQueryClient();

  const prefetchData = async () => {
    // 1. Get user for budget cycle
    const user = await getUserProfileAction();
    const cycle = user?.budget_cycle_start || 1;

    // 2. Prefetch first page of transactions
    // Note: Query key must match the infinite query key on the client
    await queryClient.prefetchInfiniteQuery({
      queryKey: ['transactions', undefined, undefined, cycle],
      queryFn: async ({ pageParam = 1 }) => {
        const data = await serverApi('/transactions', {
          params: {
            page: pageParam,
            budget_cycle_start: cycle,
            limit: 20,
          },
        } as Record<string, unknown>); // Cast as record because serverApi handles params differently currently
        return data.data;
      },
      initialPageParam: 1,
    });
  };

  await prefetchData();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionsView />
    </HydrationBoundary>
  );
}
