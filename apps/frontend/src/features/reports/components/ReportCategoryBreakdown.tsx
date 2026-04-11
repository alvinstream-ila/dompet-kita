import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategorySummary } from '@/types';

interface ReportCategoryBreakdownProps {
  sortedCategories: CategorySummary[];
  totalIncome: number;
  totalExpense: number;
}

export const ReportCategoryBreakdown: React.FC<
  ReportCategoryBreakdownProps
> = ({ sortedCategories, totalIncome, totalExpense }) => {
  return (
    <div className="mb-8 rounded-[48px] border border-white/80 bg-white/60 p-6 shadow-2xl backdrop-blur-2xl md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-sm font-black tracking-[0.2em] text-slate-800 uppercase">
          Breakdown Kategori
        </h3>
        <span className="rounded-full border border-slate-100 px-3 py-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
          Top 3 Teratas
        </span>
      </div>
      <div className="space-y-4">
        {sortedCategories.slice(0, 3).map((cat) => {
          const total = cat.type === 'income' ? totalIncome : totalExpense;
          const percentage =
            total > 0 ? Math.round((cat.amount / total) * 100) : 0;
          return (
            <div
              key={`${cat.type}-${cat.category}`}
              className="group flex cursor-pointer flex-col justify-between gap-4 rounded-[32px] border border-white bg-white/80 p-6 shadow-sm transition-all hover:translate-x-2 hover:bg-white sm:flex-row sm:items-center"
            >
              <div className="flex flex-col">
                <span className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Kategori {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
                <span className="text-lg font-black tracking-tight text-slate-800">
                  {cat.category}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end md:gap-6">
                <span
                  className={cn(
                    'text-lg font-black tracking-tighter tabular-nums md:text-xl',
                    cat.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                  )}
                >
                  Rp {cat.amount.toLocaleString('id-ID')}
                </span>
                <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-black tracking-widest text-slate-500 uppercase shadow-inner transition-colors group-hover:bg-slate-200 md:px-4 md:text-[10px]">
                  {percentage}%
                </div>
                <ChevronRight
                  className={cn(
                    'h-5 w-5 transform text-slate-200 transition-all group-hover:translate-x-1',
                    cat.type === 'income'
                      ? 'group-hover:text-emerald-500'
                      : 'group-hover:text-rose-500'
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
