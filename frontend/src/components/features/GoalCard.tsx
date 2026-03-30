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
import { cn, formatToRupiah } from "@/lib/utils";
import type { Goal } from '@/hooks/useGoals';

const ICON_MAP: Record<string, React.ElementType> = {
  heart: Heart,
  home: Home,
  car: Car,
  plane: Plane,
  shopping: ShoppingBag,
  work: Briefcase,
  game: Gamepad,
  target: Target,
  trending: TrendingUp
};

interface GoalCardProps {
  goal: Goal;
  index: number;
  onDelete: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, index, onDelete }) => {
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
      <div className={cn(
        "group relative bg-white rounded-[32px] p-8 shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-100/50 h-full flex flex-col transform-gpu hover:-translate-y-1",
        isCompleted && "bg-slate-50/50 grayscale-[0.5]"
      )}>
        {isCompleted && (
          <div className="absolute top-6 right-6">
            <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
              Terwujud! ✨
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-8">
          <div className={cn(
            "size-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500",
            isCompleted ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-500"
          )}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1 line-clamp-1">{goal.name}</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {isCompleted ? 'Mimpi Terwujud' : 'Dalam Proses'}
            </span>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sudah Ada</p>
              <p className="text-lg font-black text-slate-900 tracking-tight">{formatToRupiah(goal.current_amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Target</p>
              <p className="font-bold text-slate-600 text-sm">{formatToRupiah(goal.target_amount)}</p>
            </div>
          </div>

          <div className="space-y-2">
             <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isCompleted ? "bg-emerald-500" : "bg-linear-to-r from-blue-500 to-indigo-500"
                  )}
                />
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</span>
                <span className="text-[11px] font-black text-slate-900 tabular-nums">{Math.round(progress)}%</span>
             </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[9px] font-black">
              <Calendar size={12} />
              {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Cepat atau Lambat'}
           </div>
           {!isCompleted && (
             <button 
               onClick={() => onDelete(goal.id)}
               className="p-2 text-slate-300 hover:text-rose-500 transition-colors active:scale-90"
             >
               <Trash2 size={16} />
             </button>
           )}
        </div>
      </div>
    </motion.div>
  );
};
