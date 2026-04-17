'use client';

import { motion } from 'framer-motion';

/**
 * Dompet Kita - Premium Glassmorphism Loader
 * Provides an elegant, animated skeleton and pulse effect during route streaming.
 * Uses Tailwind CSS 4 syntax (bg-linear-* and z-100).
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#e5f1fa]">
      <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-white/40 bg-white/40 p-8 shadow-xl">
        {/* Animated Background Shine */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 skew-x-12 bg-linear-to-r from-transparent via-white/50 to-transparent opacity-30"
        />

        {/* Pulsing Core Illustration (Simulated) */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="from-blue-royal/20 to-pink-primary/20 relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/50 bg-linear-to-br"
        >
          <div className="border-blue-royal/30 border-t-blue-royal h-12 w-12 animate-spin rounded-full border-4" />
        </motion.div>

        {/* Skeleton Texts */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-48 animate-pulse rounded-full bg-slate-400/20" />
          <div className="h-4 w-32 animate-pulse rounded-full bg-slate-400/10" />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-sm font-medium tracking-widest text-slate-500/60 uppercase"
      >
        Syncing Your Wealth...
      </motion.p>
    </div>
  );
}
