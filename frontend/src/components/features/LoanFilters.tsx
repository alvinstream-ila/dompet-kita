import React from 'react';
import { 
  Search, 
  LayoutGrid,
  Plus,
  Pencil,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface LoanFiltersProps {
  localSearch: string;
  onLocalSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenAddModal: () => void;
}

export const LoanFilters: React.FC<LoanFiltersProps> = ({
  localSearch,
  onLocalSearchChange,
  onSearchSubmit,
  filterType,
  onFilterTypeChange,
  isEditMode,
  onToggleEditMode,
  onOpenAddModal
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 rounded-[32px] bg-white shadow-sm border border-slate-50 transition-all hover:shadow-md">
      <div className="flex flex-1 w-full gap-3 sm:gap-4 flex-col sm:flex-row">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
          <Input 
            placeholder="Cari titipan sayang kita..."
            value={localSearch}
            onChange={(e) => onLocalSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
            className="h-14 pl-14 rounded-2xl bg-slate-50/50 border-none font-bold focus-visible:ring-pink-500/10 shadow-inner hover:bg-slate-100 transition-colors"
          />
        </div>
        <Select value={filterType} onValueChange={onFilterTypeChange}>
          <SelectTrigger className="w-full sm:w-[200px] h-14 rounded-2xl bg-slate-50/50 border-none font-black text-[10px] uppercase tracking-[0.2em] shadow-inner text-slate-500 group">
            <div className="flex items-center gap-3">
              <LayoutGrid className="size-4 text-slate-400 group-hover:text-pink-500 transition-colors" />
              <SelectValue placeholder="Tipe Titipan" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-3xl border-none shadow-2xl p-2">
            <SelectItem value="all" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-3">Semua Titipan</SelectItem>
            <SelectItem value="utang" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-3 text-rose-500">Titipan Masuk</SelectItem>
            <SelectItem value="piutang" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-3 text-emerald-500">Titipan Keluar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleEditMode}
          className={cn(
            "h-14 w-14 rounded-2xl border transition-all active:scale-95 group shadow-sm",
            isEditMode ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200" : "bg-white border-slate-100 hover:bg-slate-50"
          )}
          title="Mode Edit"
        >
          <Pencil className={cn("size-5", isEditMode ? "text-white" : "text-slate-400 group-hover:text-pink-500")} strokeWidth={2.5} />
        </Button>
        <Button 
          onClick={onOpenAddModal}
          className="flex-1 md:flex-none h-14 px-10 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95 group"
        >
          <Plus className="size-5 group-hover:rotate-90 transition-transform duration-500" strokeWidth={3} />
          Catat Titipan Baru
        </Button>
      </div>
    </div>
  );
};
