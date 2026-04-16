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
function Skeleton({
  className,
  variant = 'default',
  ...props
}: Readonly<SkeletonProps>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md',
        // Base Color
        variant === 'default' && 'bg-slate-200/50 dark:bg-slate-800/50',
        variant === 'glass' &&
          'border border-white/30 bg-white/10 shadow-inner backdrop-blur-md',

        // Enhanced Premium Shimmer Effect
        'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite_linear] after:bg-linear-to-r after:from-transparent after:via-white/20 after:to-transparent',

        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
