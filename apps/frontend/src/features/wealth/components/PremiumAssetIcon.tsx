import React from 'react';
import {
  BarChart3,
  Bitcoin,
  Gem,
  Wallet,
  PieChart,
  Activity,
  Landmark,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssetType } from '@/types';

interface AssetTheme {
  icon: LucideIcon;
  gradient: string;
  shadow: string;
  glow: string;
}

const ASSET_THEMES: Record<string, AssetTheme> = {
  STOCK: {
    icon: BarChart3,
    gradient: 'from-blue-600 to-indigo-600',
    shadow: 'shadow-blue-500/20',
    glow: 'bg-blue-400',
  },
  CRYPTO: {
    icon: Bitcoin,
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/20',
    glow: 'bg-amber-400',
  },
  COMMODITY: {
    icon: Gem,
    gradient: 'from-yellow-400 to-amber-500',
    shadow: 'shadow-yellow-500/20',
    glow: 'bg-yellow-300',
  },
  MUTUAL_FUND: {
    icon: PieChart,
    gradient: 'from-violet-600 to-purple-600',
    shadow: 'shadow-violet-500/20',
    glow: 'bg-violet-400',
  },
  CASH: {
    icon: Wallet,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
    glow: 'bg-emerald-400',
  },
  OBLIGASI: {
    icon: Landmark,
    gradient: 'from-slate-600 to-slate-800',
    shadow: 'shadow-slate-500/20',
    glow: 'bg-slate-400',
  },
  DEFAULT: {
    icon: Activity,
    gradient: 'from-slate-400 to-slate-600',
    shadow: 'shadow-slate-500/10',
    glow: 'bg-slate-300',
  },
};

interface PremiumAssetIconProps {
  type: AssetType;
  className?: string;
  iconClassName?: string;
}

export const PremiumAssetIcon: React.FC<PremiumAssetIconProps> = ({
  type,
  className,
  iconClassName,
}) => {
  const theme = ASSET_THEMES[type.toUpperCase()] || ASSET_THEMES.DEFAULT;
  const Icon = theme.icon;

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Layer 1: Luminous Underglow (Mesh Gradient Style) */}
      <div
        className={cn(
          'absolute inset-0 -z-10 animate-pulse rounded-[inherit] opacity-40 blur-2xl',
          theme.glow
        )}
      />

      {/* Layer 2: Glass Container */}
      <div
        className={cn(
          'relative flex h-full w-full items-center justify-center overflow-hidden rounded-[20px]',
          'border border-white/40 bg-white/30 shadow-inner backdrop-blur-xl',
          'before:absolute before:inset-0 before:bg-linear-to-br before:from-white/40 before:to-transparent',
          theme.shadow
        )}
      >
        {/* Layer 3: Tactile Icon with Inner Gradient */}
        <div
          className={cn(
            'relative z-10 flex h-full w-full items-center justify-center bg-linear-to-br bg-clip-text text-transparent',
            theme.gradient
          )}
        >
          <Icon
            className={cn(
              'size-1/2 drop-shadow-sm transition-transform duration-500 group-hover:scale-110',
              iconClassName
            )}
            strokeWidth={2.5}
          />
        </div>

        {/* Subtle Shine Reflection */}
        <div className="pointer-events-none absolute top-0 left-0 h-[200%] w-full -translate-y-1/2 rotate-35 bg-linear-to-b from-white/20 to-transparent" />
      </div>
    </div>
  );
};
