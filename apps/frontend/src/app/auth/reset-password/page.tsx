'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import {
  Lock,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Mail,
  Heart,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * ResetPasswordContent - Inner component for premium OTP reset experience 🔐
 */
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const email = searchParams?.get('email');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If no email, redirect back to login
  useEffect(() => {
    if (!email) {
      router.push('/auth/login');
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedData = value.substring(0, 6).split('');
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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

  const handleReset = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length < 6) {
      setError('Masukkan kodenya dulu ya, Sayang! ❤️');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Passwordnya nggak sama nih sayang, cek lagi ya? 🥺');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/reset-password', {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        'Gagal reset password sayang. Coba cek kodenya lagi ya? ❤️';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e5f1fa] p-4">
      {/* Premium Background Blobs */}
      <div className="animate-blob absolute top-0 left-0 -z-10 h-64 w-64 rounded-full bg-blue-400 opacity-20 mix-blend-multiply blur-3xl filter" />
      <div className="animate-blob animation-delay-2000 absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-purple-400 opacity-20 mix-blend-multiply blur-3xl filter" />
      <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-20 -z-10 h-64 w-64 rounded-full bg-pink-400 opacity-20 mix-blend-multiply blur-3xl filter" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
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
                    <CheckCircle className="h-16 w-16 text-white" />
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-4xl font-black tracking-tighter text-slate-800 uppercase">
                    Yatta! 🎉
                  </h2>
                  <p className="mt-3 text-lg font-bold text-emerald-600">
                    Password Berhasil Diganti!
                  </p>
                  <p className="mt-1 text-xs font-black tracking-widest text-slate-500 uppercase">
                    Siap Mengatur Masa Depan Lagi...
                  </p>
                </div>

                <div className="flex items-center gap-2 font-black text-blue-500 italic">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Redirecting to Login...</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="reset-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-xl">
                    <Lock className="h-12 w-12 text-blue-500" />
                  </div>
                  <h1 className="text-center text-3xl font-black tracking-tighter text-slate-800 uppercase">
                    Secured Recovery
                  </h1>
                  <p className="mt-2 text-center text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
                    Pulihkan Akses Dompet Kita
                  </p>
                </div>

                <div className="rounded-3xl bg-blue-500/5 p-6 text-center">
                  <p className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Kode aman dikirim ke:
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-800">
                    {email}
                  </p>
                </div>

                <form onSubmit={handleReset} className="space-y-8">
                  {/* Step 1: OTP Entry */}
                  <div className="space-y-4">
                    <label
                      htmlFor="reset-0"
                      className="ml-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                    >
                      6-Digit Security Code
                    </label>
                    <div className="flex justify-between gap-2">
                      {[
                        'reset-0',
                        'reset-1',
                        'reset-2',
                        'reset-3',
                        'reset-4',
                        'reset-5',
                      ].map((id, index) => (
                        <input
                          key={id}
                          id={id}
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
                            error?.includes('Kode')
                              ? 'ring-2 ring-rose-500/50'
                              : 'ring-1 ring-slate-100'
                          )}
                          required
                        />
                      ))}
                    </div>
                  </div>

                  {/* Step 2: New Password Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="new-password"
                        className="ml-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                      >
                        New Secret Password
                      </label>
                      <div className="relative">
                        <input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-14 w-full rounded-2xl border-none bg-white px-6 font-bold text-slate-800 shadow-inner transition-all outline-none focus:ring-4 focus:ring-blue-500/20"
                          placeholder="Minimal 8 karakter ya Sayang"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="confirm-password"
                        className="ml-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                      >
                        Confirm New Password
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) =>
                          setPasswordConfirmation(e.target.value)
                        }
                        className="h-14 w-full rounded-2xl border-none bg-white px-6 font-bold text-slate-800 shadow-inner transition-all outline-none focus:ring-4 focus:ring-blue-500/20"
                        placeholder="Ulangi password barumu"
                        required
                      />
                    </div>
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
                        'Ganti Password ✨'
                      )}
                    </Button>
                  </div>
                </form>

                <button
                  onClick={() => router.push('/auth/login')}
                  className="mx-auto flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase transition-colors hover:text-slate-600"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Batal / Kembali Ke Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Casual/Heartwarming Footer */}
        <p className="mt-8 text-center text-xs font-bold tracking-widest text-slate-400 uppercase">
          Dompet Kita Guardians • Slotted with Love{' '}
          <Heart
            size={10}
            className="inline-block fill-pink-500 text-pink-500"
          />
        </p>
      </motion.div>
    </div>
  );
}

/**
 * Main Page Entry
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#e5f1fa]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
              Preparing Secure Channel...
            </p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
