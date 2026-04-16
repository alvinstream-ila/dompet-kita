import {
  Activity,
  BarChart3,
  Bitcoin,
  Gem,
  Landmark,
  type LucideIcon,
  PieChart,
  Wallet,
} from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';
import type { AssetType } from '@/types';

interface AssetTheme {
  icon: LucideIcon;
  gradient: string;
  shadow: string;
  glow: string;
  color: string;
}

const ASSET_THEMES: Record<string, AssetTheme> = {
  STOCK: {
    icon: BarChart3,
    gradient: 'from-blue-royal to-blue-royal/80',
    shadow: 'shadow-blue-royal/20',
    glow: 'bg-blue-royal/40',
    color: 'text-blue-royal',
  },
  CRYPTO: {
    icon: Bitcoin,
    gradient: 'from-yellow-outlook/80 to-yellow-outlook',
    shadow: 'shadow-yellow-outlook/20',
    glow: 'bg-yellow-outlook/40',
    color: 'text-yellow-outlook',
  },
  COMMODITY: {
    icon: Gem,
    gradient: 'from-amber-400 to-yellow-outlook',
    shadow: 'shadow-yellow-outlook/20',
    glow: 'bg-yellow-outlook/30',
    color: 'text-yellow-outlook',
  },
  MUTUAL_FUND: {
    icon: PieChart,
    gradient: 'from-violet-600 to-purple-600',
    shadow: 'shadow-violet-500/20',
    glow: 'bg-violet-400',
    color: 'text-violet-600',
  },
  CASH: {
    icon: Wallet,
    gradient: 'from-green-stat to-green-stat/80',
    shadow: 'shadow-green-stat/20',
    glow: 'bg-green-stat/40',
    color: 'text-green-stat',
  },
  OBLIGASI: {
    icon: Landmark,
    gradient: 'from-slate-600 to-slate-800',
    shadow: 'shadow-slate-500/20',
    glow: 'bg-slate-400',
    color: 'text-slate-700',
  },
  DEFAULT: {
    icon: Activity,
    gradient: 'from-slate-400 to-slate-600',
    shadow: 'shadow-slate-500/10',
    glow: 'bg-slate-300',
    color: 'text-slate-600',
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
            'relative z-10 flex h-full w-full items-center justify-center',
            theme.color
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
