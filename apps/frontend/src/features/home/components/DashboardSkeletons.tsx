import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * StatCardSkeleton - 3D Card Loading State 🃏
 */
export function StatCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:gap-8">
      {['dash_stat_1', 'dash_stat_2', 'dash_stat_3'].map((key) => (
        <div
          key={key}
          className="h-32 w-full rounded-[32px] border border-white/40 bg-white/20 p-6 shadow-xl backdrop-blur-md md:h-40"
        >
          <Skeleton className="mb-4 h-3 w-20 rounded-full opacity-40" />
          <Skeleton className="h-10 w-32 rounded-xl opacity-60" />
        </div>
      ))}
    </div>
  );
}

/**
 * AnalyticsSkeleton - Chart Area Loading State 📊
 */
export function AnalyticsSkeleton() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex h-[320px] w-full flex-col items-center justify-center rounded-[48px] border border-white/60 bg-white/40 p-8 shadow-2xl backdrop-blur-lg md:h-[400px]">
        <div className="absolute top-0 left-0 p-8 opacity-20">
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
        <Skeleton className="h-48 w-48 rounded-full opacity-30 md:h-64 md:w-64" />
        <div className="mt-8 flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-32 rounded-full opacity-40" />
          <Skeleton className="h-6 w-48 rounded-lg opacity-60" />
        </div>
      </div>
    </div>
  );
}

/**
 * RecentTransactionsSkeleton - Table Loading State 🧾
 */
export function RecentTransactionsSkeleton() {
  return (
    <div className="space-y-4 md:col-span-2 lg:col-span-8">
      <Card className="glass-premium rounded-[32px] border-none p-6 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-5">
          {['tx_1', 'tx_2', 'tx_3', 'tx_4', 'tx_5'].map((key) => (
            <div key={key} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl opacity-50" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40 rounded-full opacity-70" />
                  <Skeleton className="h-3 w-24 rounded-full opacity-40" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-lg opacity-60" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/**
 * DashboardSkeletons - Composite loading state for PPR 🌌
 */
export function DashboardSkeletons() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 md:p-8 lg:p-12">
      <StatCardSkeleton />
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-1/3">
          <AnalyticsSkeleton />
        </div>
        <div className="w-full lg:w-2/3">
          <RecentTransactionsSkeleton />
        </div>
      </div>
    </div>
  );
}
