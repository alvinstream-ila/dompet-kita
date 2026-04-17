import { LayoutGrid, Pencil, Plus, Search } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
  onOpenAddModal,
}) => {
  return (
    <div className="flex flex-col items-center justify-between gap-6 rounded-[32px] border border-slate-50 bg-white p-6 shadow-sm transition-all hover:shadow-md md:flex-row">
      <div className="flex w-full flex-1 flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="group relative flex-1">
          <Search className="group-focus-within:text-pink-primary absolute top-1/2 left-5 size-4 -translate-y-1/2 text-slate-400 transition-colors" />
          <Input
            placeholder="Cari titipan sayang kita..."
            value={localSearch}
            onChange={(e) => onLocalSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
            className="focus-visible:ring-pink-primary/10 h-14 rounded-2xl border-none bg-slate-50/50 pl-14 font-bold shadow-inner transition-colors hover:bg-slate-100"
          />
        </div>
        <Select value={filterType} onValueChange={onFilterTypeChange}>
          <SelectTrigger className="group h-14 w-full rounded-2xl border-none bg-slate-50/50 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase shadow-inner sm:w-[200px]">
            <div className="flex items-center gap-3">
              <LayoutGrid className="group-hover:text-pink-primary size-4 text-slate-400 transition-colors" />
              <SelectValue placeholder="Tipe Titipan" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-3xl border-none p-2 shadow-2xl">
            <SelectItem
              value="all"
              className="rounded-2xl py-3 text-[10px] font-black tracking-widest uppercase"
            >
              Semua Titipan
            </SelectItem>
            <SelectItem
              value="utang"
              className="text-red-stat rounded-2xl py-3 text-[10px] font-black tracking-widest uppercase"
            >
              Titipan Masuk
            </SelectItem>
            <SelectItem
              value="piutang"
              className="text-green-stat rounded-2xl py-3 text-[10px] font-black tracking-widest uppercase"
            >
              Titipan Keluar
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full items-center gap-3 md:w-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleEditMode}
          className={cn(
            'group h-14 w-14 rounded-2xl border shadow-sm transition-all active:scale-95',
            isEditMode
              ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200'
              : 'border-slate-100 bg-white hover:bg-slate-50'
          )}
          title="Mode Edit"
        >
          <Pencil
            className={cn(
              'size-5',
              isEditMode
                ? 'text-white'
                : 'group-hover:text-pink-primary text-slate-400'
            )}
            strokeWidth={2.5}
          />
        </Button>
        <Button
          onClick={onOpenAddModal}
          className="group flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-10 text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 hover:bg-slate-800 active:scale-95 md:flex-none"
        >
          <Plus
            className="size-5 transition-transform duration-500 group-hover:rotate-90"
            strokeWidth={3}
          />
          Catat Titipan Baru
        </Button>
      </div>
    </div>
  );
};
