'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { CheckCircle, XCircle, Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * VerifyEmailContent - Inner component to use useSearchParams() safely within Suspense.
 */
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const url = searchParams?.get('url');
      if (!url) {
        setStatus('error');
        setMessage('Link verifikasinya nggak ada nih sayang, coba cek emailnya lagi ya? 🥺');
        return;
      }

      try {
        // The URL from Laravel/Backend usually contains the full signed URL
        await api.get(url);
        setStatus('success');
        setMessage('Email kamu sudah terverifikasi! Sekarang kita bisa lanjut nabung bareng ya sayang! ✨');
        
        // Redirect to home after 3 seconds
        setTimeout(() => router.push('/'), 3000);
      } catch (error: unknown) {
        setStatus('error');
        let errorMsg = 'Gagal memverifikasi email, coba minta link baru ya sayang? ❤️';
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          errorMsg = axiosError.response?.data?.message || errorMsg;
        }
        
        setMessage(errorMsg);
      }
    };

    if (searchParams) {
      verify();
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#e5f1fa] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[48px] border border-white/60 bg-white/40 p-8 text-center shadow-2xl backdrop-blur-2xl md:p-10"
      >
        <div className="flex flex-col items-center">
          {status === 'loading' ? (
            <Loader2 className="mb-6 h-16 w-16 animate-spin text-blue-500" />
          ) : status === 'success' ? (
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 shadow-emerald-200/50 shadow-lg">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
          ) : (
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 shadow-rose-200/50 shadow-lg">
              <XCircle className="h-10 w-10 text-rose-600" />
            </div>
          )}

          <h1 className="mb-2 text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Verifikasi Email
          </h1>
          <p className="mb-6 text-sm leading-relaxed font-bold text-slate-600 uppercase tracking-tight">
            {message || 'Sabar ya sayang, lagi dicek sebentar...'}
          </p>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-lg text-pink-500 font-bold italic animate-pulse">
              <Heart className="h-5 w-5 fill-current" />
              <span>Redirecting home...</span>
            </div>
          )}

          {status === 'error' && (
            <button
              onClick={() => router.push('/auth/login')}
              className="h-12 rounded-full bg-slate-800 px-8 font-black text-white uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-900 active:scale-95"
            >
              Kembali ke Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Verify Email Page - Main Entry
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#e5f1fa]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
