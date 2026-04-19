'use client';

import * as Sentry from '@sentry/nextjs';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Dompet Kita - Graceful Error Boundary
 * Displays a premium fallback UI when an application-level error occurs.
 */
export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#e5f1fa] p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-3xl border border-white/40 bg-white/60 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="bg-red-stat/10 text-red-stat border-red-stat/20 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>Icon Peringatan Error</title>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          {error.message.includes('401') ||
          error.message.includes('Unauthorized')
            ? 'Sesi Telah Berakhir'
            : 'Aduh, Ada Kendala 🥺'}
        </h1>
        <p className="mb-4 leading-relaxed text-slate-500">
          {error.message.includes('401') ||
          error.message.includes('Unauthorized')
            ? 'Sesi Anda telah berakhir demi keamanan. Silakan masuk kembali untuk melanjutkan.'
            : 'Terjadi kesalahan tak terduga saat mencoba sinkronisasi dompet Anda. Jangan khawatir, data Anda tetap aman.'}
        </p>

        {/* Diagnostic info for developers */}
        {(process.env.NODE_ENV === 'development' ||
          error.message.length < 100) && (
          <div className="mb-8 rounded-xl bg-slate-900/5 p-3 text-left">
            <p className="line-clamp-3 font-mono text-[11px] font-medium text-slate-600">
              Error: {error.message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-blue-royal shadow-blue-royal/20 w-full rounded-2xl py-4 font-semibold text-white shadow-xl transition-all hover:brightness-110 active:scale-95"
          >
            Coba Sinkron Ulang
          </button>

          {error.message.includes('401') ||
          error.message.includes('Unauthorized') ? (
            <button
              type="button"
              onClick={() => (globalThis.location.href = '/auth/login')}
              className="bg-emerald-stat shadow-emerald-stat/20 w-full rounded-2xl py-4 font-semibold text-white shadow-xl transition-all hover:brightness-110 active:scale-95"
            >
              Masuk Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (globalThis.location.href = '/')}
              className="w-full rounded-2xl border border-white/50 bg-white/40 py-3 font-medium text-slate-600 transition-all hover:bg-white/60"
            >
              Kembali ke Dashboard
            </button>
          )}
        </div>

        {error.digest && (
          <p className="mt-8 font-mono text-[10px] tracking-tighter text-slate-400">
            REF_AUDIT: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}
