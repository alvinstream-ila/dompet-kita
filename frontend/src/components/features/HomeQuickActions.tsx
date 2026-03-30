import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plane, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  {
    id: 'scan',
    icon: Sparkles,
    label: 'Scan Struk',
    path: '/scan',
    gradient: 'bg-linear-to-br from-amber-400 to-orange-500',
    shadow: 'shadow-amber-100',
  },
  {
    id: 'holiday',
    icon: Plane,
    label: 'Liburan',
    path: '/holiday',
    gradient: 'bg-linear-to-br from-blue-400 to-indigo-500',
    shadow: 'shadow-blue-100',
  },
  {
    id: 'mimpi',
    icon: Sparkles,
    label: 'Mimpi Kita',
    path: '/mimpi-kita',
    gradient: 'bg-linear-to-br from-pink-400 to-rose-500',
    shadow: 'shadow-pink-100',
  },
  {
    id: 'wealth',
    icon: TrendingUp,
    label: 'Wealth',
    path: '/wealth',
    gradient: 'bg-linear-to-br from-indigo-500 to-violet-600',
    shadow: 'shadow-indigo-100',
  },
];

export const HomeQuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:col-span-2 md:mb-0 md:gap-4 lg:col-span-3 lg:grid-cols-1">
      {QUICK_ACTIONS.map((btn) => (
        <motion.button
          key={btn.id}
          whileHover={{
            scale: 1.02,
            y: -5,
            transition: { duration: 0.2, ease: 'easeOut' },
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(btn.path)}
          className={cn(
            'group relative flex flex-col items-center gap-3 overflow-hidden rounded-[32px] border border-none border-white/20 p-4 shadow-xl transition-all sm:p-5 lg:flex-row lg:gap-5',
            btn.gradient,
            btn.shadow,
            btn.id === 'mimpi' && 'col-span-2 lg:col-span-1'
          )}
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-white/10 bg-white/20 shadow-lg backdrop-blur-xl transition-transform group-hover:scale-110 md:h-12 md:w-12">
            <btn.icon className="size-5 text-white md:size-6" strokeWidth={3} />
          </div>
          <div className="flex flex-col text-center lg:text-left">
            <span className="text-[9px] leading-tight font-black tracking-[0.2em] text-white uppercase md:text-[11px]">
              {btn.label}
            </span>
            <span className="mt-1 hidden text-[7px] font-bold tracking-widest text-white/60 uppercase opacity-0 transition-opacity group-hover:opacity-100 md:text-[8px] lg:block">
              Ayo Cek Sekarang ✨
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
