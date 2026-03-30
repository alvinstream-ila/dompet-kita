import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import type { CategorySummary } from '@/types';

interface ReportCategoryBreakdownProps {
  sortedCategories: CategorySummary[];
  totalIncome: number;
  totalExpense: number;
}

export const ReportCategoryBreakdown: React.FC<ReportCategoryBreakdownProps> = ({
  sortedCategories,
  totalIncome,
  totalExpense
}) => {
  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[48px] p-6 md:p-10 mb-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Breakdown Kategori</h3>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-3 py-1 rounded-full">Top 3 Teratas</span>
      </div>
      <div className="space-y-4">
        {sortedCategories.slice(0, 3).map((cat) => {
          const total = cat.type === 'income' ? totalIncome : totalExpense;
          const percentage = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
          return (
            <div 
              key={`${cat.type}-${cat.category}`} 
              className="bg-white/80 p-6 rounded-[32px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white shadow-sm hover:translate-x-2 hover:bg-white transition-all cursor-pointer group"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Kategori {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
                <span className="text-lg font-black text-slate-800 tracking-tight">{cat.category}</span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6">
                <span className={cn(
                  "text-lg md:text-xl font-black tracking-tighter tabular-nums", 
                  cat.type === 'income' ? 'text-emerald-500' : 'text-blue-500'
                )}>
                  Rp {cat.amount.toLocaleString('id-ID')}
                </span>
                <div className="bg-slate-100 px-3 md:px-4 py-1.5 rounded-full font-black text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest shrink-0 shadow-inner group-hover:bg-slate-200 transition-colors">
                  {percentage}%
                </div>
                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-500 transition-all transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
