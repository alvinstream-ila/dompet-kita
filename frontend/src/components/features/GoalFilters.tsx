import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  onAddGoal
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-white/60 backdrop-blur-xl p-5 rounded-[32px] shadow-sm border border-white/60">
      <div className="flex flex-1 w-full gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input 
            placeholder="Cari mimpi kita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 rounded-2xl bg-slate-50/50 border-none font-bold focus:ring-blue-500/10 shadow-inner"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: 'all' | 'active' | 'completed') => setStatusFilter(v)}>
          <SelectTrigger className="w-[160px] h-12 rounded-2xl bg-slate-50/50 border-none font-black text-[10px] uppercase tracking-widest text-slate-500">
            <SelectValue placeholder="STATUS" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl">
            <SelectItem value="all" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3">Semua Mimpi</SelectItem>
            <SelectItem value="active" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 text-blue-500">Masih Berjalan</SelectItem>
            <SelectItem value="completed" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 text-emerald-500">Mimpi Mewujud</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        onClick={onAddGoal}
        className="w-full md:w-auto h-12 px-10 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95"
      >
        <Plus size={18} strokeWidth={3} />
        Tambah Mimpi Kita
      </Button>
    </div>
  );
};
