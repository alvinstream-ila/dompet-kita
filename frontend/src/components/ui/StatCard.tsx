import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useFormatting } from '@/hooks/useFormatting';

interface StatCardProps {
  title: string;
  amount: number;
  icon?: LucideIcon;
  imageSrc?: string;
  variant?: 'saldo' | 'income' | 'expense';
}

export const StatCard = React.memo(({ title, amount, icon: Icon, imageSrc, variant = 'saldo' }: StatCardProps) => {
  const getVariants = () => {
    switch (variant) {
      case 'income':
        return { 
          text: 'text-emerald-600', 
          iconBg: 'bg-emerald-50', 
          iconColor: 'text-emerald-600',
          gradient: 'from-emerald-500/5 to-transparent',
          shadow: 'shadow-emerald-500/10'
        };
      case 'expense':
        return { 
          text: 'text-rose-600', 
          iconBg: 'bg-rose-50', 
          iconColor: 'text-rose-600',
          gradient: 'from-rose-500/5 to-transparent',
          shadow: 'shadow-rose-500/10'
        };
      default:
        return { 
          text: 'text-slate-900', 
          iconBg: 'bg-slate-50', 
          iconColor: 'text-slate-600',
          gradient: 'from-blue-500/5 to-transparent',
          shadow: 'shadow-blue-500/10'
        };
    }
  };

  const colors = getVariants();
  const { formatAmount } = useFormatting();

  return (
    <Card className={cn(
      "relative overflow-hidden border-none shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 active:scale-[0.95] cursor-pointer bg-white group rounded-[32px]",
      colors.shadow
    )}>
      <div className={cn("absolute inset-0 bg-linear-to-br opacity-40", colors.gradient)} />
      <CardContent className="relative z-10 p-6 sm:p-8 flex flex-col items-center text-center gap-5">
        <div className={cn(
          "p-4 rounded-3xl transition-all duration-700 group-hover:scale-110 shadow-sm transform-gpu group-hover:rotate-6", 
          colors.iconBg, 
          colors.iconColor
        )}>
          {imageSrc ? (
            <img src={imageSrc} alt={title} className="w-12 h-12 sm:w-14 sm:h-14 object-contain animate-float" />
          ) : Icon ? (
            <Icon className="w-7 h-7 sm:w-8 sm:h-8 animate-float" />
          ) : null}
        </div>
        <div className="space-y-1.5">
          <h3 className="text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.25em]">{title}</h3>
          <p className={cn("text-xl sm:text-2xl md:text-3xl font-black tracking-tighter", colors.text)}>
            {formatAmount(amount)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';
