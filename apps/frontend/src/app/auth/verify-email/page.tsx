'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/features/auth';
import {
  ShieldCheck,
  Mail,
  Loader2,
  Heart,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Cookies from 'js-cookie';

/**
 * OTP Verification Page - The Gatekeeper 🛡️
 * A premium, secure experience for final onboarding.
 */
export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, login: setAuthData, logout } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already verified, go home
  useEffect(() => {
    if (user?.email_verified_at) {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.substring(0, 6).split('');
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);

      // Focus last filled or next
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Masukkan 6 digit kodenya dulu ya, Sayang! ❤️');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/email/verify-code', { code });
      setSuccess(true);

      // Update local storage/context with verified user
      setAuthData(Cookies.get('auth_token') || '', data.user);

      // Dramatic delay for the "Wow" success state
      setTimeout(() => {
        router.push('/');
      }, 2500);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Waduh, kodenya salah nih. Coba cek lagi ya? 🥺';
      setError(errorMsg);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await api.post('/email/verification-notification');
      alert('Kode baru sudah meluncur ke email kamu, Sayang! 🚀❤️');
    } catch (err: unknown) {
      console.error('Resend OTP error:', err);
      setError('Gagal kirim ulang, coba sebentar lagi ya? ❤️');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f0f7ff] p-4 text-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg"
      >
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-pink-200/50 blur-3xl" />

        <div className="relative z-10 overflow-hidden rounded-[48px] border border-white/60 bg-white/40 p-10 shadow-2xl backdrop-blur-2xl md:p-14">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-6 py-10"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2 }}
                    className="absolute -inset-4 rounded-full bg-emerald-100/50 blur-xl"
                  />
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-[40px] bg-emerald-500 shadow-2xl shadow-emerald-500/40">
                    <Heart className="h-16 w-16 fill-white text-white" />
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-4xl font-black tracking-tighter text-slate-800 uppercase">
                    Yatta! 🎉
                  </h2>
                  <p className="mt-3 text-lg font-bold text-emerald-600">
                    Email Berhasil Diverifikasi!
                  </p>
                  <p className="mt-1 text-xs font-black tracking-widest text-slate-500 uppercase">
                    Siap Mengatur Masa Depan Bareng...
                  </p>
                </div>

                <div className="flex items-center gap-2 font-black text-blue-500 italic">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Entering Dashboard...</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="verify-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-xl">
                    <ShieldCheck className="h-12 w-12 text-blue-500" />
                  </div>
                  <h1 className="text-center text-3xl font-black tracking-tighter text-slate-800 uppercase">
                    Verify Your Identity
                  </h1>
                  <p className="mt-2 text-center text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
                    Pintu Gerbang Keamanan Dompet Kita
                  </p>
                </div>

                <div className="rounded-3xl bg-blue-500/5 p-6 text-center">
                  <p className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Kodenya dikirim ke:
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-800">
                    {user?.email || 'email-kamu@example.com'}
                  </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-8">
                  <div className="flex justify-between gap-2">
                    {['otp-0', 'otp-1', 'otp-2', 'otp-3', 'otp-4', 'otp-5'].map(
                      (id, index) => (
                        <input
                          key={id}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otp[index]}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className={cn(
                            'h-14 w-full rounded-2xl border-none bg-white text-center text-2xl font-black text-slate-800 shadow-inner transition-all outline-none focus:ring-4 focus:ring-blue-500/20',
                            error
                              ? 'ring-2 ring-rose-500/50'
                              : 'ring-1 ring-slate-100'
                          )}
                          required
                        />
                      )
                    )}
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-xs font-bold tracking-wider text-rose-500 uppercase"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-16 w-full rounded-3xl bg-slate-900 text-lg font-black tracking-widest text-white uppercase shadow-2xl transition-all hover:bg-slate-800 active:scale-[0.98]"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        'Verifikasi Sekarang ✨'
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="flex w-full items-center justify-center gap-2 text-xs font-black tracking-widest text-slate-500 uppercase transition-colors hover:text-blue-500"
                    >
                      {resending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Kirim Ulang Kode Sayang
                    </button>
                  </div>
                </form>

                <button
                  onClick={() => logout()}
                  className="mx-auto flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase transition-colors hover:text-slate-600"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Ganti Akun / Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
