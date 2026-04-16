'use client';

import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useFormatting } from '@/lib/hooks/useFormatting';
import { cn } from '@/lib/utils';

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
            text: 'text-[var(--color-green-stat)]',
            iconBg: 'bg-[var(--color-green-stat)]/10',
            iconColor: 'text-[var(--color-green-stat)]',
            gradient: 'from-[var(--color-green-stat)]/5 to-transparent',
            shadow: 'shadow-[var(--color-green-stat)]/10',
          };
        case 'expense':
          return {
            text: 'text-[var(--color-red-stat)]',
            iconBg: 'bg-[var(--color-red-stat)]/10',
            iconColor: 'text-[var(--color-red-stat)]',
            gradient: 'from-[var(--color-red-stat)]/5 to-transparent',
            shadow: 'shadow-[var(--color-red-stat)]/10',
          };
        default:
          return {
            text: 'text-slate-900',
            iconBg: 'bg-[var(--color-blue-royal)]/10',
            iconColor: 'text-[var(--color-blue-royal)]',
            gradient: 'from-[var(--color-blue-royal)]/5 to-transparent',
            shadow: 'shadow-[var(--color-blue-royal)]/10',
          };
      }
    };

    const colors = getVariants();
    const { formatAmount } = useFormatting();

    let iconContent: React.ReactNode = null;
    if (imageSrc) {
      iconContent = (
        <Image
          src={imageSrc}
          alt={title}
          width={56}
          height={56}
          className="animate-float object-contain"
        />
      );
    } else if (Icon) {
      iconContent = <Icon className="animate-float h-7 w-7 sm:h-8 sm:w-8" />;
    }

    return (
      <Card
        className={cn(
          'group glass-card relative cursor-pointer overflow-hidden transition-[transform,shadow,scale] duration-300 hover:-translate-y-1 active:scale-[0.95]',
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
            {iconContent}
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
