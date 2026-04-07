import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export type GoalStatus = 'all' | 'active' | 'completed';

interface GoalFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: GoalStatus;
  setStatusFilter: (filter: GoalStatus) => void;
  onAddGoal: () => void;
}

export const GoalFilters: React.FC<GoalFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onAddGoal,
}) => {
  return (
    <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-[32px] border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-xl md:flex-row">
      <div className="flex w-full flex-1 gap-3">
        <div className="group relative flex-1">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" />
          <Input
            placeholder="Cari mimpi kita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-2xl border-none bg-slate-50/50 pl-12 font-bold shadow-inner focus:ring-blue-500/10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v: 'all' | 'active' | 'completed') =>
            setStatusFilter(v)
          }
        >
          <SelectTrigger className="h-12 w-[160px] rounded-2xl border-none bg-slate-50/50 text-[10px] font-black tracking-widest text-slate-500 uppercase">
            <SelectValue placeholder="STATUS" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl">
            <SelectItem
              value="all"
              className="rounded-xl py-3 text-[10px] font-black tracking-widest uppercase"
            >
              Semua Mimpi
            </SelectItem>
            <SelectItem
              value="active"
              className="rounded-xl py-3 text-[10px] font-black tracking-widest text-blue-500 uppercase"
            >
              Masih Berjalan
            </SelectItem>
            <SelectItem
              value="completed"
              className="rounded-xl py-3 text-[10px] font-black tracking-widest text-emerald-500 uppercase"
            >
              Mimpi Mewujud
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={onAddGoal}
        className="flex h-12 w-full items-center gap-2 rounded-2xl bg-slate-900 px-10 font-black tracking-widest text-white uppercase shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95 md:w-auto"
      >
        <Plus size={18} strokeWidth={3} />
        Tambah Mimpi Kita
      </Button>
    </div>
  );
};
