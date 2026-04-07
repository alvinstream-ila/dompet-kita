'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { motion } from 'framer-motion';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#e5f1fa] text-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl"
      >
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-red-100/50 text-red-600 border border-red-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Gagal Memuat Transaksi
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Terjadi kesalahan tak terduga saat mencoba sinkronisasi dompet Anda. 
          Sistem telah mencatat kejanggalan ini untuk audit.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95"
          >
            Coba Sinkron Ulang
          </button>
          
          <button
            onClick={() => (globalThis.location.href = '/')}
            className="w-full py-3 rounded-2xl bg-white/40 text-slate-600 font-medium border border-white/50 transition-all hover:bg-white/60"
          >
            Kembali ke Dashboard
          </button>
        </div>

        {error.digest && (
          <p className="mt-8 text-[10px] text-slate-400 font-mono tracking-tighter">
            REF_AUDIT: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}
