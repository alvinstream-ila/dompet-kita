import { motion } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  Car,
  Gamepad,
  Heart,
  Home,
  Plane,
  Plus,
  ShoppingBag,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn, formatToRupiah } from '@/lib/utils';
import type { Goal } from '@/types';
import { AddGoalDepositModal } from './AddGoalDepositModal';

const ICON_MAP: Record<string, React.ElementType> = {
  heart: Heart,
  home: Home,
  car: Car,
  plane: Plane,
  shopping: ShoppingBag,
  work: Briefcase,
  game: Gamepad,
  target: Target,
  trending: TrendingUp,
};

interface GoalCardProps {
  goal: Goal;
  index: number;
  onDelete: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  index,
  onDelete,
}) => {
  const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
  const Icon = (goal.icon && ICON_MAP[goal.icon]) || Target;
  const progress = (goal.current_amount / goal.target_amount) * 100;
  const isCompleted = goal.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      layout
    >
      <div
        className={cn(
          'group glass-card relative flex h-full transform-gpu flex-col p-8 transition-all duration-500 hover:-translate-y-1',
          isCompleted && 'bg-white/40 grayscale-[0.3]'
        )}
      >
        {isCompleted && (
          <div className="absolute top-6 right-6">
            <div className="border-green-stat/20 bg-green-stat/10 text-green-stat rounded-full border px-3 py-1 text-[9px] font-black tracking-widest uppercase">
              Terwujud! ✨
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center gap-4">
          <div
            className={cn(
              'flex size-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110',
              isCompleted
                ? 'bg-slate-200/50 text-slate-400'
                : 'bg-blue-royal/10 text-blue-royal'
            )}
          >
            <Icon size={24} />
          </div>
          <div>
            <h3 className="mb-1 line-clamp-1 text-xl leading-none font-black tracking-tight text-slate-800">
              {goal.name}
            </h3>
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              {isCompleted ? 'Mimpi Terwujud' : 'Dalam Proses'}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="mb-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                Sudah Ada
              </p>
              <p className="text-lg font-black tracking-tight text-slate-900">
                {formatToRupiah(goal.current_amount)}
              </p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                Target
              </p>
              <p className="text-sm font-bold text-slate-600">
                {formatToRupiah(goal.target_amount)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-full overflow-hidden rounded-full border border-white/20 bg-slate-100/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isCompleted
                    ? 'bg-green-stat'
                    : 'from-blue-royal to-pink-primary bg-linear-to-r'
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Progress
              </span>
              <span className="text-[11px] font-black text-slate-900 tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100/50 pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200/50 bg-white/50 px-2 py-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
              <Calendar size={12} className="text-blue-royal" />
              {goal.deadline
                ? new Date(goal.deadline).toLocaleDateString()
                : 'Sesuai Takdir'}
            </div>
            {!isCompleted && (
              <button
                onClick={() => onDelete(goal.id)}
                className="hover:text-red-stat p-2 text-slate-300 transition-colors active:scale-90"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {!isCompleted && (
            <Button
              onClick={() => setIsDepositModalOpen(true)}
              className="bg-blue-royal shadow-blue-royal/20 h-10 rounded-2xl px-6 text-[10px] font-black tracking-widest text-white uppercase shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="mr-2 h-3 w-3" strokeWidth={4} />
              Nabung ✨
            </Button>
          )}
        </div>
      </div>

      <AddGoalDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        goal={goal}
      />
    </motion.div>
  );
};
