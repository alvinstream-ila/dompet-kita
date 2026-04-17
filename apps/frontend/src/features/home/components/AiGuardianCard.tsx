import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock,
  Info,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  ZapOff,
} from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';
import { useAiGuardian } from '../hooks/useAiGuardian';

// --- Sub-components to reduce Cognitive Complexity ---

const GuardianLoading: React.FC = () => (
  <div className="group glass-card relative h-48 w-full overflow-hidden p-8 shadow-inner ring-1 ring-white/20 backdrop-blur-sm dark:bg-slate-800/30 dark:ring-slate-700/30">
    <div className="animate-shimmer from-blue-royal via-pink-primary to-blue-royal absolute inset-x-0 top-0 h-1 bg-linear-to-r" />
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-2 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200/50 dark:bg-slate-700/50" />
    </div>
  </div>
);

interface GuardianErrorProps {
  error: unknown;
  onRefresh: () => void;
  isRefetching: boolean;
}

const GuardianError: React.FC<GuardianErrorProps> = ({
  error,
  onRefresh,
  isRefetching,
}) => {
  const isRateLimited =
    axios.isAxiosError(error) && error.response?.status === 429;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex h-full min-h-48 w-full flex-col items-center justify-center space-y-4 overflow-hidden rounded-[40px] border border-slate-200 bg-white/50 p-8 text-center shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/50"
    >
      <div className="relative">
        <div className="bg-pink-primary/20 absolute inset-0 animate-ping rounded-full" />
        <div className="bg-pink-primary/10 relative rounded-2xl p-4 dark:bg-violet-900/30">
          {isRateLimited ? (
            <Clock className="text-pink-primary h-8 w-8" />
          ) : (
            <ZapOff className="text-red-stat h-8 w-8" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="font-black tracking-tight text-slate-800 dark:text-slate-100">
          {isRateLimited ? 'AI Sedang Berhibernasi' : 'Guardian Terputus'}
        </h5>
        <p className="max-w-[200px] text-xs leading-relaxed font-medium text-slate-500">
          {isRateLimited
            ? 'Oops, kuota AI lagi habis nih Sayang. Coba lagi 1 jam lagi ya, atau klik refresh pas aku udah bangun! 😴'
            : 'Gagal terhubung ke Guardian Engine. Coba lagi nanti ya sayang.. 🥺'}
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefetching}
        className="group relative flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-[10px] font-black tracking-widest text-white uppercase transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-slate-900"
      >
        <RotateCw
          className={cn(
            'h-3 w-3 transition-transform duration-700',
            isRefetching && 'animate-spin'
          )}
        />
        Coba Refresh
      </button>
    </motion.div>
  );
};

interface StrategicAdviceProps {
  rebalance?: {
    action: 'HOLD' | 'INVEST' | 'REPLENISH';
    amount?: number;
    reason: string;
  }[];
  isCrisis: boolean;
}

const StrategicAdvice: React.FC<StrategicAdviceProps> = ({
  rebalance,
  isCrisis,
}) => {
  if (!rebalance || rebalance.length === 0 || rebalance[0].action === 'HOLD')
    return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'group flex items-start gap-5 rounded-[28px] border border-dashed p-6 transition-all',
        isCrisis
          ? 'border-slate-300 bg-white/40 dark:border-slate-700 dark:bg-slate-900/30'
          : 'border-slate-700 bg-slate-800/50'
      )}
    >
      <div className="rounded-2xl bg-violet-500/10 p-3 shadow-inner">
        <TrendingUp className="h-5 w-5 text-violet-500 dark:text-violet-400" />
      </div>
      <div className="flex-1">
        <p className="mb-1.5 text-[11px] font-black tracking-widest text-violet-500 uppercase">
          Strategic Advice
        </p>
        <p
          className={cn(
            'text-[15px] leading-normal font-medium',
            isCrisis ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400'
          )}
        >
          {rebalance[0].reason}
        </p>
      </div>
    </motion.div>
  );
};

// --- Main AI Guardian Card Component ---

export const AiGuardianCard: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useAiGuardian();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) return <GuardianLoading />;

  if (isError) {
    return (
      <GuardianError
        error={error}
        onRefresh={handleRefresh}
        isRefetching={isRefetching}
      />
    );
  }

  const { prediction, rebalance } = data?.data || {};
  const status = prediction?.status || 'safe';
  const isCrisis = status !== 'safe';

  const statusConfig = {
    CRITICAL: {
      bg: 'bg-red-stat/10 dark:bg-rose-950/20',
      border: 'border-red-stat/20 dark:border-rose-900/50',
      text: 'text-red-stat',
      subText: 'text-red-stat/70',
      accent: 'bg-red-stat',
    },
    WARNING: {
      bg: 'bg-yellow-outlook/10 dark:bg-amber-950/20',
      border: 'border-yellow-outlook/20 dark:border-amber-900/50',
      text: 'text-yellow-outlook',
      subText: 'text-yellow-outlook/70',
      accent: 'bg-yellow-outlook',
    },
    CAUTION: {
      bg: 'bg-orange-50/80 dark:bg-orange-950/20',
      border: 'border-orange-200 dark:border-orange-900/50',
      text: 'text-orange-600 dark:text-orange-400',
      subText: 'text-orange-400 dark:text-orange-500',
      accent: 'bg-orange-500',
    },
    safe: {
      bg: 'bg-slate-900/95 dark:bg-black/80 shadow-[0_20px_50px_-12px_rgba(74,108,247,0.25)]',
      border: 'border-slate-800 dark:border-slate-700/50',
      text: 'text-white',
      subText: 'text-blue-royal',
      accent: 'bg-blue-royal',
    },
  }[status as keyof typeof statusConfig] || {
    bg: 'bg-slate-900',
    border: 'border-none',
    text: 'text-white',
    subText: 'text-blue-royal',
    accent: 'bg-blue-royal',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'group relative transform-gpu overflow-hidden rounded-[40px] border p-6 shadow-2xl transition-all duration-500 md:p-8',
        statusConfig.bg,
        statusConfig.border
      )}
    >
      {/* Dynamic Background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="grid grid-cols-6 gap-4 p-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <div
              key={`bg-dot-${n}`}
              className={cn(
                'h-8 w-8 transform-gpu rounded-full blur-xl transition-colors duration-1000',
                isCrisis ? 'bg-red-stat/40' : 'bg-blue-royal/40'
              )}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'rounded-2xl p-4 shadow-xl ring-1 ring-black/5',
                isCrisis ? 'bg-white' : 'bg-blue-royal/10 backdrop-blur-md'
              )}
            >
              {isCrisis ? (
                <ShieldAlert className={cn('h-7 w-7', statusConfig.text)} />
              ) : (
                <ShieldCheck className="text-blue-royal h-7 w-7" />
              )}
            </div>
            <div>
              <h4
                className={cn(
                  'mb-1 text-xl leading-none font-black tracking-tight',
                  isCrisis
                    ? 'text-slate-800 dark:text-white'
                    : 'text-white dark:text-slate-100'
                )}
              >
                AI Guardian
              </h4>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-1.5 w-1.5 animate-pulse rounded-full',
                    statusConfig.accent
                  )}
                />
                <p
                  className={cn(
                    'text-[10px] font-black tracking-[0.2em] uppercase',
                    statusConfig.subText
                  )}
                >
                  Status: {status}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefetching}
            className={cn(
              'group relative rounded-2xl p-3 transition-all active:scale-90',
              isCrisis
                ? 'bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/50'
                : 'bg-white/10 hover:bg-white/20'
            )}
            title="Update AI Guardian Status"
          >
            <RotateCw
              className={cn(
                'h-5 w-5 transition-all duration-700',
                isCrisis
                  ? 'text-slate-600 dark:text-slate-300'
                  : 'text-slate-400 group-hover:text-white',
                isRefetching && 'animate-spin'
              )}
            />
            {isRefetching && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="bg-blue-royal/75 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-blue-royal relative inline-flex h-3 w-3 rounded-full"></span>
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 space-y-5">
          <div
            className={cn(
              'rounded-[28px] p-6 shadow-sm ring-1 ring-black/5',
              isCrisis
                ? 'bg-white/80 dark:bg-slate-900/50'
                : 'bg-white/5 backdrop-blur-md'
            )}
          >
            <p
              className={cn(
                'text-[17px] leading-relaxed font-bold tracking-tight',
                isCrisis
                  ? 'text-slate-700 dark:text-slate-200'
                  : 'text-slate-200'
              )}
            >
              {prediction?.message}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <StrategicAdvice rebalance={rebalance} isCrisis={isCrisis} />
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex -space-x-2.5">
            <div className="bg-blue-royal z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 text-[10px] font-black text-white shadow-lg">
              AI
            </div>
            <div className="bg-pink-primary flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 text-[10px] font-black text-white shadow-lg">
              G2
            </div>
          </div>

          <div
            className={cn(
              'group flex items-center gap-3 rounded-2xl px-5 py-2.5 transition-all',
              isCrisis
                ? 'bg-slate-900/5 text-slate-600 dark:bg-white/5 dark:text-slate-400'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            )}
          >
            <div className="rounded-full bg-slate-500/10 p-1">
              <Info className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
                Monthly Burn Rate
              </span>
              <span className="text-xs font-bold tabular-nums">
                Rp {prediction?.burn_rate?.toLocaleString()}/day
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
