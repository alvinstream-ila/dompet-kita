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
    } catch (err: any) {
      console.error('Failed to resend verification', err);
      setError(err.response?.data?.message || 'Gagal kirim link nih sayang, coba lagi nanti ya? 🥺');
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
        className="bg-slate-900 border-b border-white/5 relative z-50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center animate-pulse">
              <Mail className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-[11px] font-black text-white uppercase tracking-wider">
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
                  className="text-[10px] text-rose-400 font-bold"
                >
                  {error}
                </motion.span>
              )}
            </AnimatePresence>

            <button 
              onClick={handleResend}
              disabled={loading || sent}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all duration-300
                ${sent 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-yellow-400 text-slate-900 hover:bg-yellow-300 active:scale-95 disabled:opacity-50'
                }
              `}
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
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Sabar ya...</span>
                    </>
                  ) : sent ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Terkirim! ✨</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
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
