import React from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Calendar,
  Trash2,
  Heart,
  Home,
  Car,
  Plane,
  ShoppingBag,
  Briefcase,
  Gamepad,
  TrendingUp,
} from 'lucide-react';
import { cn, formatToRupiah } from '@/lib/utils';
import type { Goal } from '@/types';

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
          'group relative flex h-full transform-gpu flex-col rounded-[32px] border border-slate-100/50 bg-white p-8 shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl',
          isCompleted && 'bg-slate-50/50 grayscale-[0.5]'
        )}
      >
        {isCompleted && (
          <div className="absolute top-6 right-6">
            <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[9px] font-black tracking-widest text-emerald-600 uppercase">
              Terwujud! ✨
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center gap-4">
          <div
            className={cn(
              'flex size-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-500 group-hover:scale-110',
              isCompleted
                ? 'bg-slate-100 text-slate-400'
                : 'bg-blue-50 text-blue-500'
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
            <div className="h-3 w-full overflow-hidden rounded-full border border-slate-100/50 bg-slate-50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isCompleted
                    ? 'bg-emerald-500'
                    : 'bg-linear-to-r from-blue-500 to-indigo-500'
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

        <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
          <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-slate-400 uppercase">
            <Calendar size={12} />
            {goal.deadline
              ? new Date(goal.deadline).toLocaleDateString()
              : 'Cepat atau Lambat'}
          </div>
          {!isCompleted && (
            <button
              onClick={() => onDelete(goal.id)}
              className="p-2 text-slate-300 transition-colors hover:text-rose-500 active:scale-90"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
