import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, TrendingUp, Info } from 'lucide-react';
import { useAiGuardian } from '../hooks/useAiGuardian';
import { cn } from '@/lib/utils';

export const AiGuardianCard: React.FC = () => {
  const { data, isLoading, isError, error } = useAiGuardian();

  if (isLoading) {
    return (
      <div className="h-48 w-full animate-pulse rounded-[40px] bg-slate-100" />
    );
  }

  if (isError) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-[40px] bg-slate-100 p-8 text-center">
        <p className="text-sm leading-loose font-bold tracking-widest text-slate-400 uppercase">
          {(error as any)?.status === 429
            ? 'Oopss, AI Guardian lagi istirahat bentar ya Sayang.. ❤️'
            : 'Gagal terhubung ke Guardian Engine. Coba lagi nanti ya sayang.. 🥺'}
        </p>
      </div>
    );
  }

  const { prediction, rebalance } = data?.data || {};
  const status = prediction?.status || 'safe';

  const statusConfig = {
    CRITICAL: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-600',
      subText: 'text-rose-400',
    },
    WARNING: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-600',
      subText: 'text-amber-400',
    },
    CAUTION: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      subText: 'text-orange-400',
    },
    safe: {
      bg: 'bg-slate-900',
      border: 'border-none',
      text: 'text-white',
      subText: 'text-blue-400',
    },
  }[status] || {
    bg: 'bg-slate-900',
    border: 'border-none',
    text: 'text-white',
    subText: 'text-blue-400',
  };

  const isCrisis = status !== 'safe';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative transform-gpu overflow-hidden rounded-[40px] p-6 shadow-2xl transition-all md:p-8',
        statusConfig.bg,
        statusConfig.border,
        isCrisis && 'border-2'
      )}
    >
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="grid grid-cols-6 gap-4 p-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <div
              key={`bg-dot-${n}`}
              className="h-8 w-8 transform-gpu rounded-full bg-blue-400 blur-xl"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'rounded-2xl p-3 shadow-lg',
                isCrisis ? 'bg-white/80' : 'bg-blue-500/20'
              )}
            >
              {isCrisis ? (
                <ShieldAlert className={cn('h-6 w-6', statusConfig.text)} />
              ) : (
                <ShieldCheck className="h-6 w-6 text-blue-400" />
              )}
            </div>
            <div>
              <h4
                className={cn(
                  'text-lg font-black tracking-tight',
                  isCrisis ? 'text-slate-800' : 'text-white'
                )}
              >
                AI Guardian Protection
              </h4>
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

        <div className="flex-1 space-y-4">
          <div
            className={cn(
              'rounded-[24px] p-5',
              isCrisis ? 'bg-white/60' : 'bg-white/5'
            )}
          >
            <p
              className={cn(
                'text-[15px] leading-relaxed font-bold',
                isCrisis ? 'text-slate-700' : 'text-slate-300'
              )}
            >
              {prediction?.message}
            </p>
          </div>

          {rebalance &&
            rebalance.length > 0 &&
            rebalance[0].action !== 'HOLD' && (
              <div
                className={cn(
                  'group flex items-start gap-4 rounded-[24px] border border-dashed p-5 transition-all',
                  isCrisis
                    ? 'border-slate-300 bg-white/40'
                    : 'border-slate-700 bg-slate-800/50'
                )}
              >
                <div className="rounded-xl bg-violet-500/10 p-2">
                  <TrendingUp className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-[11px] font-black tracking-widest text-violet-500 uppercase">
                    Strategic Advice
                  </p>
                  <p
                    className={cn(
                      'text-sm leading-normal font-medium',
                      isCrisis ? 'text-slate-700' : 'text-slate-400'
                    )}
                  >
                    {rebalance[0].reason}
                  </p>
                </div>
              </div>
            )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex -space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-blue-500 text-[10px] font-black text-white">
              AI
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-violet-500 text-[10px] font-black text-white">
              G2
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2',
              isCrisis
                ? 'bg-white/50 text-slate-600'
                : 'bg-slate-800 text-slate-400'
            )}
          >
            <Info className="h-3 w-3" />
            <span className="text-[9px] font-black tracking-widest uppercase">
              Burn Rate: Rp {prediction?.burn_rate?.toLocaleString()}/day
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
