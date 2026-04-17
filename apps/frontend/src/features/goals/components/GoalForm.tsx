import {
  Briefcase,
  Car,
  Gamepad,
  Heart,
  Home,
  Loader2,
  Plane,
  ShoppingBag,
  Target,
  CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, formatToRupiah, getTerbilang } from '@/lib/utils';
import type { Goal } from '@/types';
import { useAddGoal, useUpdateGoal } from '../hooks/useGoals';

interface GoalFormProps {
  readonly onSuccess?: () => void;
  readonly goal?: Goal | null;
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
  const [targetAmount, setTargetAmount] = useState(
    goal?.target_amount ? formatToRupiah(goal.target_amount.toString()) : ''
  );
  const [deadline, setDeadline] = useState(goal?.deadline || '');
  const [selectedIcon, setSelectedIcon] = useState(goal?.icon || 'heart');

  const addGoalMutation = useAddGoal();
  const updateGoalMutation = useUpdateGoal();

  const loading = addGoalMutation.isPending || updateGoalMutation.isPending;

  let buttonText = 'Simpan Mimpi Kita ✨';
  if (goal) {
    buttonText = 'Perbarui Mimpi Kita ✨';
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    const payload = {
      name,
      target_amount: Number.parseFloat(targetAmount.replaceAll('.', '')),
      deadline: deadline || null,
      icon: selectedIcon,
      category: 'dream',
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
        <label
          htmlFor="goal-name"
          className="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
        >
          Apa Mimpimu, Sayang?
        </label>
        <div className="relative">
          <Target className="text-blue-royal absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
          <Input
            id="goal-name"
            placeholder="Contoh: Rumah Impian / DP Mobil"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus:ring-blue-royal/20 h-14 rounded-2xl border-none bg-slate-50 pl-12 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="goal-amount"
          className="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
        >
          Target Tabungan (Rp)
        </label>
        <div className="relative">
          <div className="bg-blue-royal/10 absolute top-1/2 left-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full">
            <span className="text-blue-royal text-sm font-bold">Rp</span>
          </div>
          <Input
            id="goal-amount"
            placeholder="0"
            value={targetAmount}
            onChange={(e) => setTargetAmount(formatToRupiah(e.target.value))}
            className="focus:ring-blue-royal/20 h-14 rounded-2xl border-none bg-slate-50 pl-14 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2"
            required
          />
        </div>
        {targetAmount && (
          <p className="text-blue-royal mt-1 px-2 text-[10px] font-bold italic">
            {getTerbilang(Number(targetAmount.replaceAll('.', '')))} Rupiah
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 text-left">
          <label
            htmlFor="goal-deadline"
            className="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
          >
            Deadline (Opsional)
          </label>
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="goal-deadline"
                  variant="outline"
                  className={cn(
                    'h-14 w-full justify-start rounded-2xl border-none bg-slate-50 px-4 font-bold text-slate-700 hover:bg-slate-100',
                    !deadline && 'text-slate-300'
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 opacity-70" />
                  {deadline ? (
                    format(new Date(deadline), 'd MMMM yyyy', {
                      locale: id,
                    })
                  ) : (
                    <span>Pilih Tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto border-none p-0 shadow-2xl"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={deadline ? new Date(deadline) : undefined}
                  onSelect={(d) => d && setDeadline(format(d, 'yyyy-MM-dd'))}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label
            htmlFor="goal-icon-list"
            className="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
          >
            Pilih Icon
          </label>
          <div
            id="goal-icon-list"
            className="scrollbar-none flex gap-2 overflow-x-auto scroll-smooth pb-2"
          >
            {ICONS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all',
                    selectedIcon === item.name
                      ? 'bg-blue-royal text-white shadow-lg'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="group from-blue-royal shadow-blue-royal/20 hover:bg-blue-royal/90 h-16 w-full rounded-[24px] bg-linear-to-r to-indigo-600 text-sm font-black tracking-widest text-white uppercase shadow-xl transition-all"
      >
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : buttonText}
      </Button>
    </form>
  );
};
