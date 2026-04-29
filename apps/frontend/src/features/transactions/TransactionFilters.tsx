import { ChevronDown, RefreshCw, Search, Settings2 } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TransactionFiltersProps {
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly selectedCategory: string;
  readonly onCategoryChange: (category: string) => void;
  readonly categories: string[];
  readonly onOpenCategoryModal: () => void;
  readonly onRefresh: () => void;
  readonly isFetching: boolean;
  readonly selectedMonth: number;
  readonly onMonthChange: (month: number) => void;
  readonly selectedYear: number;
  readonly onYearChange: (year: number) => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onOpenCategoryModal,
  onRefresh,
  isFetching,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
}) => {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="mb-10 flex flex-col items-center justify-between gap-5 rounded-[32px] border border-slate-50 bg-white p-5 shadow-sm transition-all hover:shadow-md lg:flex-row">
      <div className="flex w-full flex-1 flex-col gap-3 sm:flex-row sm:gap-4">
        {/* Period Selection */}
        <div className="flex gap-3">
          <div className="group relative w-full sm:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="focus:ring-blue-royal/5 h-14 w-full min-w-[140px] cursor-pointer appearance-none rounded-2xl border-none bg-slate-50/50 pr-10 pl-6 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase shadow-inner transition-colors group-hover:bg-slate-100 focus:ring-4 focus:outline-none"
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-slate-400 transition-transform group-hover:translate-y-0.5" />
          </div>

          <div className="group relative w-full sm:w-auto">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="focus:ring-blue-royal/5 h-14 w-full min-w-[100px] cursor-pointer appearance-none rounded-2xl border-none bg-slate-50/50 pr-10 pl-6 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase shadow-inner transition-colors group-hover:bg-slate-100 focus:ring-4 focus:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-slate-400 transition-transform group-hover:translate-y-0.5" />
          </div>
        </div>

        <div className="group relative flex-1">
          <Search className="group-focus-within:text-blue-royal absolute top-1/2 left-5 size-4 -translate-y-1/2 text-slate-400 transition-colors" />
          <Input
            placeholder="Cari transaksi jajan kita, Sayang..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="focus-visible:ring-blue-royal/10 h-14 rounded-2xl border-none bg-slate-50/50 pl-14 font-bold shadow-inner transition-colors group-hover:bg-slate-100"
          />
        </div>
        <div className="group relative w-full sm:w-auto">
          <Settings2 className="group-focus-within:text-blue-royal pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-slate-400 transition-colors" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="focus:ring-blue-royal/5 h-14 w-full min-w-[200px] cursor-pointer appearance-none rounded-2xl border-none bg-slate-50/50 pr-12 pl-14 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase shadow-inner transition-colors group-hover:bg-slate-100 focus:ring-4 focus:outline-none"
          >
            {categories.map((cat: string) => (
              <option
                key={cat}
                value={cat}
                className="py-3 text-[10px] font-bold tracking-widest uppercase"
              >
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-5 size-4 -translate-y-1/2 text-slate-400 transition-transform group-hover:translate-y-0.5" />
        </div>
      </div>
      <div className="flex w-full gap-3 lg:w-auto">
        <Button
          variant="outline"
          onClick={onOpenCategoryModal}
          className="h-14 flex-1 rounded-2xl border-slate-100 bg-white px-8 text-[10px] font-black tracking-[0.2em] uppercase shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md lg:flex-none"
        >
          Manage Kategori
        </Button>
        <Button
          onClick={onRefresh}
          disabled={isFetching}
          className="flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-10 text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 hover:bg-slate-800 active:scale-95 lg:flex-none"
        >
          <RefreshCw
            className={cn('size-4', isFetching && 'animate-spin')}
            strokeWidth={3}
          />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};
