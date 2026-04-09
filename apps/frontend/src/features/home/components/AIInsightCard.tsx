import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Heart, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIInsights } from '../hooks/useAIInsights';

export const AIInsightCard: React.FC = () => {
  const {
    data: insight,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAIInsights();

  const renderContent = () => {
    if (isLoading) {
      return (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-3"
        >
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
        </motion.div>
      );
    }

    if (isError) {
      return (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-600">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-[12px] font-bold tracking-tight">
              {(error as any)?.status === 429
                ? 'Wah, asistennya lagi butuh istirahat sebentar nih Sayang.. ❤️'
                : 'Yah, koneksi AI-nya lagi keganggu sebentar nih Sayang.. 🥺'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5 text-xs font-black tracking-widest text-slate-500 uppercase transition-all hover:bg-slate-100 active:scale-95"
          >
            <RefreshCcw className="h-3 w-3" />
            Coba Lagi
          </button>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="content"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-3"
      >
        <h5 className="text-sm leading-tight font-black tracking-tight text-pink-600 md:text-base">
          {insight?.data?.title}
        </h5>
        <p className="border-l-4 border-pink-100 py-1 pl-4 text-[14px] leading-relaxed font-medium text-slate-600 italic md:text-[16px]">
          &quot;{insight?.data?.insight}&quot;
        </p>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative h-full transform-gpu overflow-hidden rounded-[40px] border-none bg-white p-6 shadow-xl transition-all hover:-translate-y-1 md:p-8"
    >
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-pink-500/5 via-violet-500/5 to-transparent opacity-100" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-pink-50 p-2.5 shadow-inner">
              <Heart className="h-5 w-5 fill-pink-100 text-pink-500" />
            </div>
            <h4 className="text-base font-black tracking-tight text-slate-800 md:text-lg">
              Pesan Sayang Buat Kamu ✨
            </h4>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="rounded-xl p-2 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCcw
              className={cn(
                'h-4 w-4 text-slate-400',
                (isLoading || isFetching) && 'animate-spin'
              )}
            />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="rounded-full bg-pink-50 px-3 py-1 text-[9px] font-black tracking-widest text-pink-600 uppercase">
            Pesan Kasih Sayang
          </div>
          <Heart className="h-3 w-3 animate-pulse fill-pink-500 text-pink-500" />
        </div>
      </div>
    </motion.div>
  );
};
