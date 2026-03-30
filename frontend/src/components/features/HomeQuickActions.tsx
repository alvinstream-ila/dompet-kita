import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Plane, 
  TrendingUp, 
} from 'lucide-react';
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { id: 'scan', icon: Sparkles, label: 'Scan Struk', path: '/scan', gradient: 'bg-linear-to-br from-amber-400 to-orange-500', shadow: 'shadow-amber-100' },
  { id: 'holiday', icon: Plane, label: 'Liburan', path: '/holiday', gradient: 'bg-linear-to-br from-blue-400 to-indigo-500', shadow: 'shadow-blue-100' },
  { id: 'mimpi', icon: Sparkles, label: 'Mimpi Kita', path: '/mimpi-kita', gradient: 'bg-linear-to-br from-pink-400 to-rose-500', shadow: 'shadow-pink-100' },
  { id: 'wealth', icon: TrendingUp, label: 'Wealth', path: '/wealth', gradient: 'bg-linear-to-br from-indigo-500 to-violet-600', shadow: 'shadow-indigo-100' },
];

export const HomeQuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4 md:mb-0 mb-4">
      {QUICK_ACTIONS.map((btn) => (
        <motion.button
          key={btn.id}
          whileHover={{ 
            scale: 1.02, 
            y: -5,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(btn.path)}
          className={cn(
            "flex flex-col lg:flex-row items-center gap-3 lg:gap-5 p-4 sm:p-5 rounded-[32px] border-none shadow-xl transition-all group overflow-hidden relative border border-white/20",
            btn.gradient,
            btn.shadow,
            btn.id === 'mimpi' && "col-span-2 lg:col-span-1"
          )}
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-[20px] bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-xl border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
            <btn.icon className="size-5 md:size-6 text-white" strokeWidth={3} />
          </div>
          <div className="flex flex-col text-center lg:text-left">
            <span className="font-black uppercase tracking-[0.2em] text-[9px] md:text-[11px] text-white leading-tight">
                {btn.label}
            </span>
            <span className="text-[7px] md:text-[8px] font-bold text-white/60 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">Ayo Cek Sekarang ✨</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
