import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: 'default' | 'glass' | 'shimmer';
}

/**
 * Skeleton - Premium Shimmering Placeholder 💎
 *
 * Optimized for Glassmorphism and dark/light modes.
 * Uses a subtle hardware-accelerated animation.
 */
function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md',
        // Base Color
        variant === 'default' && 'bg-slate-200/60 dark:bg-slate-800/60',
        variant === 'glass' &&
          'border border-white/20 bg-white/20 shadow-inner backdrop-blur-sm',

        // The Shimmer Effect
        'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent',

        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
