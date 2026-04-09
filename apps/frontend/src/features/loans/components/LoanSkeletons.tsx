import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * LoanStatSkeleton - Loading state for loan summaries 💰
 */
export function LoanStatSkeleton() {
  return (
    <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8">
      {['loan_stat_1', 'loan_stat_2', 'loan_stat_3'].map((key) => (
        <div
          key={key}
          className="h-28 w-full rounded-3xl bg-white/40 p-6 shadow-lg"
        >
          <Skeleton className="mb-3 h-3 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
      ))}
    </div>
  );
}

/**
 * LoanCardSkeleton - Loading state for individual loan cards 🤝
 */
export function LoanCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {['loan_1', 'loan_2', 'loan_3', 'loan_4', 'loan_5', 'loan_6'].map(
        (key) => (
          <div
            key={key}
            className="h-48 w-full rounded-[32px] border border-white/50 bg-white/40 p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="mb-3 h-4 w-full" />
            <div className="mt-6 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        )
      )}
    </div>
  );
}
