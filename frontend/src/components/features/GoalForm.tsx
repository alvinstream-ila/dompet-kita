import React, { useState } from 'react';
import { 
  Target, 
  Heart,
  Home,
  Car,
  Plane,
  ShoppingBag,
  Briefcase,
  Gamepad,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddGoal, useUpdateGoal } from '@/hooks/useGoals';
import { cn, formatToRupiah, getTerbilang } from "@/lib/utils";
import type { Goal } from '@/types';

interface GoalFormProps {
  onSuccess?: () => void;
  goal?: Goal | null;
}

const ICONS = [
  { name: 'heart', icon: Heart },
  { name: 'home', icon: Home },
  { name: 'car', icon: Car },
  { name: 'plane', icon: Plane },
  { name: 'shopping', icon: ShoppingBag },
  { name: 'work', icon: Briefcase },
  { name: 'game', icon: Gamepad },
  { name: 'target', icon: Target },
];

export const GoalForm: React.FC<GoalFormProps> = ({ onSuccess, goal }) => {
  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount ? formatToRupiah(goal.target_amount.toString()) : '');
  const [deadline, setDeadline] = useState(goal?.deadline || '');
  const [selectedIcon, setSelectedIcon] = useState(goal?.icon || 'heart');
  
  const addGoalMutation = useAddGoal();
  const updateGoalMutation = useUpdateGoal();

  const loading = addGoalMutation.isPending || updateGoalMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    const payload = {
      name,
      target_amount: parseFloat(targetAmount.replace(/\./g, '')),
      deadline: deadline || null,
      icon: selectedIcon,
      category: 'dream'
    };

    if (goal) {
      await updateGoalMutation.mutateAsync({ id: goal.id, ...payload });
    } else {
      await addGoalMutation.mutateAsync(payload);
    }

    onSuccess?.();
    if (!goal) {
        setName('');
        setTargetAmount('');
        setDeadline('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Apa Mimpimu, Sayang?</label>
        <div className="relative">
          <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
          <Input 
            placeholder="Contoh: Rumah Impian / DP Mobil" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 pl-12 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Target Tabungan (Rp)</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">Rp</span>
          </div>
          <Input 
            placeholder="0" 
            value={targetAmount}
            onChange={(e) => setTargetAmount(formatToRupiah(e.target.value))}
            className="h-14 pl-14 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        {targetAmount && (
          <p className="text-[10px] font-bold text-blue-500 italic px-2 mt-1">
            {getTerbilang(Number(targetAmount.replace(/\./g, '')))} Rupiah
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 text-left">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Deadline (Opsional)</label>
          <div className="relative">
            <Input 
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-14 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-400 block w-full px-4"
            />
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Pilih Icon</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
            {ICONS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
                    selectedIcon === item.name ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-16 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-[24px] shadow-xl shadow-blue-200 font-black uppercase tracking-widest text-sm group transition-all"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (goal ? "Perbarui Mimpi Kita ✨" : "Simpan Mimpi Kita ✨")}
      </Button>
    </form>
  );
};
