import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/card';

/**
 * WealthStatSkeleton - Loading state for wealth metrics 📈
 */
export function WealthStatSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {['stat_1', 'stat_2', 'stat_3'].map((key) => (
        <Card
          key={key}
          className="glass-premium h-32 w-full rounded-[32px] border-none p-6"
        >
          <Skeleton className="mb-3 h-3 w-20" />
          <Skeleton className="h-8 w-32" />
        </Card>
      ))}
    </div>
  );
}

/**
 * WealthChartSkeleton - Loading state for wealth charts 💹
 */
export function WealthChartSkeleton() {
  return (
    <Card className="glass-premium h-[400px] w-full rounded-[48px] border-none p-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <div className="mt-8 flex h-[200px] items-end justify-end gap-1">
        {[
          'bar-1',
          'bar-2',
          'bar-3',
          'bar-4',
          'bar-5',
          'bar-6',
          'bar-7',
          'bar-8',
          'bar-9',
          'bar-10',
          'bar-11',
          'bar-12',
          'bar-13',
          'bar-14',
          'bar-15',
          'bar-16',
          'bar-17',
          'bar-18',
          'bar-19',
          'bar-20',
        ].map((id, i) => {
          const heights = [
            60, 40, 80, 50, 70, 45, 90, 30, 65, 55, 75, 40, 85, 60, 50, 70, 45,
            90, 30, 65,
          ];
          return (
            <Skeleton
              key={id}
              className="w-full"
              style={{ height: `${heights[i]}%` }}
            />
          );
        })}
      </div>
    </Card>
  );
}

/**
 * WealthAssetSkeleton - Loading state for asset list 💎
 */
export function WealthAssetSkeleton() {
  return (
    <div className="space-y-4">
      {['asset_1', 'asset_2', 'asset_3', 'asset_4'].map((key) => (
        <Card
          key={key}
          className="glass-premium flex items-center justify-between rounded-[28px] border-none p-5"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-5 w-24" />
        </Card>
      ))}
    </div>
  );
}
