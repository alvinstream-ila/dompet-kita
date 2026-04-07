'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetGuardCard } from './BudgetGuardCard';
import dynamic from 'next/dynamic';

const MonthlyDonutChart = dynamic(() =>
  import('@/components/charts/MonthlyDonutChart').then((m) => m.MonthlyDonutChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-32 w-full animate-pulse items-center justify-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
        Memuat Budget...
      </div>
    )
  }
);

export const HomeBudgeting: React.FC = () => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:col-span-1 md:gap-8 lg:col-span-9 lg:mt-0 lg:grid-cols-12">
      <Card className="group flex flex-col rounded-[32px] sm:rounded-[40px] border border-white/60 bg-white/70 p-5 sm:p-6 shadow-2xl backdrop-blur-3xl md:col-span-1 md:rounded-[48px] md:p-10 lg:col-span-5">
        <CardHeader className="mb-8 flex flex-row items-center justify-between p-0">
          <div>
            <CardTitle className="mb-1 text-base font-black tracking-tighter text-slate-800 uppercase md:text-lg">
              Budgeting Tracker
            </CardTitle>
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
              Distribusi harta kita ❤️
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-3 transition-colors group-hover:bg-blue-100">
            <div className="h-1.5 w-1.5 animate-ping rounded-full bg-blue-500" />
          </div>
        </CardHeader>
        <div className="relative flex min-h-[300px] w-full flex-1 flex-col items-center justify-center">
          <React.Suspense
            fallback={
              <div className="flex h-32 w-full animate-pulse items-center justify-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Memuat Budget...
              </div>
            }
          >
            <MonthlyDonutChart />
          </React.Suspense>
        </div>
        <div className="mt-8 rounded-[24px] border border-slate-100 bg-slate-50 p-4 text-center shadow-inner">
          <h4 className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase italic">
            Monthly Balance Summary
          </h4>
          <p className="text-[11px] font-bold text-slate-700">
            Terencana Dengan Baik ✨
          </p>
        </div>
      </Card>
      <div className="scale-100 transition-transform duration-500 hover:scale-[1.01] md:col-span-1 lg:col-span-7">
        <BudgetGuardCard />
      </div>
    </div>
  );
};
