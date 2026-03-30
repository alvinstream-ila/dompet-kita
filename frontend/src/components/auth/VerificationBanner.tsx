import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

export const VerificationBanner: React.FC = () => {
  const { isVerified, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (loading || sent) return;

    setLoading(true);
    setError(null);

    try {
      await api.post('/email/verification-notification');
      setSent(true);
      // Keep "sent" status for 10 seconds for better visibility
      setTimeout(() => setSent(false), 10000);
    } catch (err: unknown) {
      console.error('Failed to resend verification', err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message ||
          'Gagal kirim link nih sayang, coba lagi nanti ya? 🥺'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || isVerified) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-50 overflow-hidden border-b border-white/5 bg-slate-900"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-2 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-yellow-400/20">
              <Mail className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-[11px] font-black tracking-wider text-white uppercase">
              Email kamu belum terverifikasi nih sayang! Cek inbox ya? 💌
            </p>
          </div>

          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-[10px] font-bold text-rose-400"
                >
                  {error}
                </motion.span>
              )}
            </AnimatePresence>

            <button
              onClick={handleResend}
              disabled={loading || sent}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase transition-all duration-300 ${
                sent
                  ? 'bg-emerald-500 text-white'
                  : 'bg-yellow-400 text-slate-900 hover:bg-yellow-300 active:scale-95 disabled:opacity-50'
              } `}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={loading ? 'loading' : sent ? 'sent' : 'default'}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Sabar ya...</span>
                    </>
                  ) : sent ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Terkirim! ✨</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      <span>Kirim Ulang Link</span>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
