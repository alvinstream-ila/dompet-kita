import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetGuardCard } from '@/components/features/BudgetGuardCard';

const MonthlyDonutChart = React.lazy(() => import('@/components/charts/MonthlyDonutChart').then(m => ({ default: m.MonthlyDonutChart })));

export const HomeBudgeting: React.FC = () => {
  return (
    <div className="md:col-span-1 lg:col-span-9 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 lg:mt-0 mt-6">
      <Card className="md:col-span-1 lg:col-span-5 flex flex-col p-6 md:p-10 bg-white/70 backdrop-blur-3xl border-white/60 shadow-2xl rounded-[40px] md:rounded-[48px] border border-white/80 group">
         <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-base md:text-lg font-black text-slate-800 uppercase tracking-tighter mb-1">Budgeting Tracker</CardTitle>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Distribusi harta kita ❤️</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
            </div>
         </CardHeader>
         <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] w-full relative">
            <React.Suspense fallback={<div className="w-full h-32 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Memuat Budget...</div>}>
              <MonthlyDonutChart />
            </React.Suspense>
         </div>
         <div className="mt-8 text-center bg-slate-50 p-4 rounded-[24px] border border-slate-100 shadow-inner">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Monthly Balance Summary</h4>
            <p className="text-[11px] font-bold text-slate-700">Terencana Dengan Baik ✨</p>
         </div>
      </Card>
      <div className="md:col-span-1 lg:col-span-7 scale-100 hover:scale-[1.01] transition-transform duration-500">
         <BudgetGuardCard />
      </div>
    </div>
  );
};
