import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useFormatting } from '@/hooks/useFormatting';

interface StatCardProps {
  title: string;
  amount: number;
  icon?: LucideIcon;
  imageSrc?: string;
  variant?: 'saldo' | 'income' | 'expense';
  isCurrency?: boolean;
  className?: string;
}

export const StatCard = React.memo(
  ({
    title,
    amount,
    icon: Icon,
    imageSrc,
    variant = 'saldo',
    isCurrency = true,
    className,
  }: StatCardProps) => {
    const getVariants = () => {
      switch (variant) {
        case 'income':
          return {
            text: 'text-emerald-600',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            gradient: 'from-emerald-500/5 to-transparent',
            shadow: 'shadow-emerald-500/10',
          };
        case 'expense':
          return {
            text: 'text-rose-600',
            iconBg: 'bg-rose-50',
            iconColor: 'text-rose-600',
            gradient: 'from-rose-500/5 to-transparent',
            shadow: 'shadow-rose-500/10',
          };
        default:
          return {
            text: 'text-slate-900',
            iconBg: 'bg-slate-50',
            iconColor: 'text-slate-600',
            gradient: 'from-blue-500/5 to-transparent',
            shadow: 'shadow-blue-500/10',
          };
      }
    };

    const colors = getVariants();
    const { formatAmount } = useFormatting();

    return (
      <Card
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-[32px] border-none bg-white shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] active:scale-[0.95]',
          colors.shadow,
          className
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-linear-to-br opacity-40',
            colors.gradient
          )}
        />
        <CardContent className="relative z-10 flex flex-col items-center gap-5 p-6 text-center sm:p-8">
          <div
            className={cn(
              'transform-gpu rounded-3xl p-4 shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-6',
              colors.iconBg,
              colors.iconColor
            )}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={title}
                className="animate-float h-12 w-12 object-contain sm:h-14 sm:w-14"
              />
            ) : Icon ? (
              <Icon className="animate-float h-7 w-7 sm:h-8 sm:w-8" />
            ) : null}
          </div>
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-black tracking-[0.25em] text-slate-400 uppercase sm:text-[12px]">
              {title}
            </h3>
            <p
              className={cn(
                'text-xl font-black tracking-tighter sm:text-2xl md:text-3xl',
                colors.text
              )}
            >
              {isCurrency ? formatAmount(amount) : amount}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';
