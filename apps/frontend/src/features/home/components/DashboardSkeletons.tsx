import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/card';

/**
 * StatCardSkeleton - 3D Card Loading State 🃏
 */
export function StatCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:gap-8">
      {['dash_stat_1', 'dash_stat_2', 'dash_stat_3'].map((key) => (
        <div
          key={key}
          className="h-32 w-full rounded-3xl bg-white/40 p-6 shadow-lg md:h-40"
        >
          <Skeleton className="mb-4 h-4 w-24" />
          <Skeleton className="h-8 w-32" />
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
    <div className="space-y-6 lg:col-span-4">
      <div className="h-64 w-full rounded-[48px] bg-white/40 p-8 shadow-xl">
        <Skeleton className="mb-8 h-6 w-1/2" />
        <div className="flex justify-center">
          <Skeleton className="h-32 w-32 rounded-full" />
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
    <div className="space-y-4 md:col-span-2 lg:col-span-4">
      <Card className="glass-premium rounded-[32px] border-none p-6">
        <Skeleton className="mb-6 h-6 w-48" />
        <div className="space-y-4">
          {['tx_1', 'tx_2', 'tx_3', 'tx_4', 'tx_5'].map((key) => (
            <div key={key} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
