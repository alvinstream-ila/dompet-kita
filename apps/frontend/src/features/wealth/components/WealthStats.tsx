import React from 'react';
import { TrendingUp, Target, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface WealthStatsProps {
  totalWealth: number;
  growthPercentage: number;
  freedomProgress: number;
  freedomMessage: string;
  formatAmount: (amount: number) => string;
}

export const WealthStats: React.FC<WealthStatsProps> = ({
  totalWealth,
  growthPercentage,
  freedomProgress,
  freedomMessage,
  formatAmount,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="group relative overflow-hidden rounded-[32px] border-none bg-slate-900 p-8 text-white shadow-xl transition-all hover:bg-slate-950">
        <TrendingUp className="pointer-events-none absolute top-4 right-4 size-24 text-white/5 transition-transform duration-700 group-hover:scale-125" />
        <div className="relative z-10">
          <p className="mb-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            Total Wealth
          </p>
          <h2 className="mb-5 text-4xl font-black tracking-tighter transition-transform group-hover:translate-x-1">
            {formatAmount(totalWealth)}
          </h2>
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border border-white/5 px-3.5 py-1.5 text-[10px] font-black backdrop-blur-md',
              growthPercentage >= 0
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            )}
          >
            <ArrowUpRight
              className={cn('size-3.5', growthPercentage < 0 && 'rotate-90')}
              strokeWidth={3}
            />
            {growthPercentage >= 0 ? '+' : ''}
            {growthPercentage.toFixed(1)}%{' '}
            {growthPercentage >= 0 ? 'NAIK' : 'TURUN'}
          </div>
        </div>
      </Card>

      <Card className="group rounded-[32px] border border-none border-slate-100 bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="mb-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
              Target Kita
            </h3>
            <p className="text-xl font-bold tracking-tight text-slate-800">
              Menuju Kebebasan Financial ✨
            </p>
          </div>
          <div className="rounded-2xl bg-pink-50 p-3 transition-colors group-hover:bg-pink-100">
            <Target className="size-6 text-pink-500" />
          </div>
        </div>
        <div className="space-y-5">
          <div className="flex items-end justify-between px-1">
            <span className="text-[11px] font-black tracking-widest text-slate-500 uppercase">
              Progress Freedom
            </span>
            <span className="text-2xl font-black text-slate-800 tabular-nums">
              {freedomProgress}%
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-100 p-1 shadow-inner">
            <Progress
              value={freedomProgress}
              className="h-full rounded-full bg-linear-to-r from-pink-500 to-rose-500 transition-all duration-1000"
            />
          </div>
          <p className="line-clamp-1 rounded-lg border-l-4 border-pink-400 bg-slate-50 px-1 py-2 text-[10px] font-black text-slate-400 italic">
            &quot;{freedomMessage}&quot;
          </p>
        </div>
      </Card>
    </div>
  );
};
