import React from 'react';
import { 
  Search,
  Settings2,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  onOpenCategoryModal: () => void;
  onRefresh: () => void;
  isFetching: boolean;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onOpenCategoryModal,
  onRefresh,
  isFetching
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center gap-5 mb-10 bg-white p-5 rounded-[32px] shadow-sm border border-slate-50 transition-all hover:shadow-md">
      <div className="flex flex-1 w-full gap-3 sm:gap-4 flex-col sm:flex-row">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input 
            placeholder="Cari transaksi jajan kita, Sayang..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-14 pl-14 rounded-2xl bg-slate-50/50 border-none font-bold focus-visible:ring-blue-500/10 shadow-inner group-hover:bg-slate-100 transition-colors"
          />
        </div>
        <div className="relative group w-full sm:w-auto">
          <Settings2 className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
          <select 
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-14 pl-14 pr-12 rounded-2xl bg-slate-50/50 border-none font-black text-[10px] uppercase tracking-[0.2em] appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/5 shadow-inner w-full min-w-[200px] text-slate-500 group-hover:bg-slate-100 transition-colors"
          >
            {categories.map((cat: string) => (
              <option key={cat} value={cat} className="font-bold py-3 uppercase text-[10px] tracking-widest">{cat}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none group-hover:translate-y-0.5 transition-transform" />
        </div>
      </div>
      <div className="flex gap-3 w-full lg:w-auto">
        <Button 
          variant="outline" 
          onClick={onOpenCategoryModal}
          className="flex-1 lg:flex-none h-14 px-8 rounded-2xl border-slate-100 font-black uppercase text-[10px] tracking-[0.2em] bg-white shadow-sm hover:shadow-md hover:bg-slate-50 transition-all hover:-translate-y-0.5"
        >
          Manage Kategori
        </Button>
        <Button 
          onClick={onRefresh}
          disabled={isFetching}
          className="flex-1 lg:flex-none h-14 px-10 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} strokeWidth={3} />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};
