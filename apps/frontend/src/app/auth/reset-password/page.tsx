'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Lock, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * ResetPasswordContent - Inner component to use useSearchParams() safely within Suspense.
 */
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const token = searchParams?.get('token');
  const email = searchParams?.get('email');

  const handleReset = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('Passwordnya nggak sama nih sayang, cek lagi ya? 🥺');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (error: unknown) {
      let errorMsg = 'Gagal reset password sayang, linknya mungkin sudah basi. Coba minta lagi ya? ❤️';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMsg = axiosError.response?.data?.message || errorMsg;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5f1fa] p-4">
        <div className="text-center rounded-[32px] bg-white p-8 shadow-xl">
          <p className="mb-4 font-black text-slate-600 uppercase tracking-tight">
            Linknya nggak lengkap nih sayang. 🥺
          </p>
          <Button onClick={() => router.push('/auth/login')} variant="premium">
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e5f1fa] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[48px] border border-white/60 bg-white/40 p-8 shadow-2xl backdrop-blur-2xl md:p-10"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[24px] bg-yellow-100/80 shadow-inner">
            <Lock className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Password Baru</h1>
          <p className="mt-1 text-[12px] font-bold tracking-wider text-slate-500 uppercase">
            Ganti password kamu biar aman ya sayang
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="font-black text-emerald-700 uppercase tracking-tight">
              Password berhasil diganti! ❤️
            </p>
            <p className="text-sm font-medium text-slate-500">
              Otomatis ke halaman login sebentar lagi...
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3 text-[11px] font-bold text-rose-600 animate-in fade-in zoom-in-95 duration-300">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="new-password" className="ml-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Password Baru
              </label>
              <input
                id="new-password"
                type="password"
                placeholder="Password minimal 8 karakter"
                className="h-14 w-full rounded-full border-none bg-slate-200/50 px-6 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirm-password" className="ml-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Konfirmasi Password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Ketik ulang passwordnya"
                className="h-14 w-full rounded-full border-none bg-slate-200/50 px-6 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-4 h-14 w-full rounded-full bg-blue-500 font-black text-white uppercase shadow-lg shadow-blue-500/30 hover:bg-blue-600 active:scale-95 transition-all"
            >
              {loading ? (
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              ) : (
                'Ganti Password Sekarang'
              )}
            </Button>

            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="flex w-full items-center justify-center gap-2 pt-2 text-[11px] font-black text-slate-400 uppercase transition-colors hover:text-slate-600"
            >
              <ArrowLeft className="h-3 w-3" />
              Batal
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Reset Password Page - Main Entry
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#e5f1fa]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
