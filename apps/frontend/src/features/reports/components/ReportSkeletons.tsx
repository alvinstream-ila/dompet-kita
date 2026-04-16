import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * ReportStatSkeleton - Loading state for high-level numbers 📊
 */
export function ReportStatSkeleton() {
  return (
    <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
      {['report_stat_1', 'report_stat_2', 'report_stat_3'].map((key) => (
        <Card
          key={key}
          className="glass-premium h-28 w-full rounded-3xl border-none p-6 shadow-xl"
        >
          <Skeleton className="mb-3 h-3 w-20" />
          <Skeleton className="h-7 w-40" />
        </Card>
      ))}
    </div>
  );
}

/**
 * ReportTableSkeleton - The "Ghost Table" for transactions 🧾
 */
export function ReportTableSkeleton() {
  return (
    <Card className="glass-premium mt-8 overflow-hidden rounded-[40px] border-none p-8 shadow-2xl">
      <div className="mb-10 flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>

      {/* Table Header Shell */}
      <div className="mb-4 flex border-b border-slate-100 pb-4">
        <Skeleton className="mr-auto h-3 w-20" />
        <Skeleton className="mr-auto h-3 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Table Rows */}
      {[
        'row-1',
        'row-2',
        'row-3',
        'row-4',
        'row-5',
        'row-6',
        'row-7',
        'row-8',
      ].map((id) => (
        <div
          key={id}
          className="flex items-center border-b border-slate-50 py-4 last:border-none"
        >
          <Skeleton className="mr-auto h-4 w-24" />
          <div className="mr-auto space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-2 w-20" />
          </div>
          <Skeleton className="h-5 w-28" />
        </div>
      ))}
    </Card>
  );
}

/**
 * ReportChartSkeleton - Loading state for diagrams 📉
 */
export function ReportChartSkeleton() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
      <Card className="glass-premium h-80 rounded-[40px] border-none p-8">
        <Skeleton className="mb-8 h-5 w-40" />
        <div className="flex h-48 items-end justify-between gap-2">
          {[70, 40, 90, 60, 80, 50].map((h, _i) => (
            <Skeleton
              key={`bar-${h}`}
              className="w-full"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </Card>
      <Card className="glass-premium flex h-80 flex-col items-center rounded-[40px] border-none p-8">
        <Skeleton className="mb-8 h-5 w-40 self-start" />
        <Skeleton className="h-40 w-40 rounded-full" />
      </Card>
    </div>
  );
}
