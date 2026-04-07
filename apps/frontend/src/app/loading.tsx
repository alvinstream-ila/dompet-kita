'use client';

import { motion } from 'framer-motion';

/**
 * Dompet Kita - Premium Glassmorphism Loader
 * Provides an elegant, animated skeleton and pulse effect during route streaming.
 * Uses Tailwind CSS 4 syntax (bg-linear-* and z-100).
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#e5f1fa]/60 backdrop-blur-md">
      <div className="relative flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/40 border border-white/40 shadow-xl overflow-hidden">
        {/* Animated Background Shine */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent skew-x-12 opacity-30"
        />

        {/* Pulsing Core Illustration (Simulated) */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="relative w-24 h-24 rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/50"
        >
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-600 animate-spin" />
        </motion.div>

        {/* Skeleton Texts */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-48 h-6 rounded-full bg-slate-400/20 animate-pulse" />
          <div className="w-32 h-4 rounded-full bg-slate-400/10 animate-pulse" />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-sm font-medium text-slate-500/60 uppercase tracking-widest"
      >
        Syncing Your Wealth...
      </motion.p>
    </div>
  );
}
