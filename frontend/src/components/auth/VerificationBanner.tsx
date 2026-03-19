import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader2, Send } from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

export const VerificationBanner: React.FC = () => {
  const { isVerified, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isAuthenticated || isVerified) return null;

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post('/email/verification-notification');
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error('Failed to resend verification', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-yellow-50 border-b border-yellow-100 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            <p className="text-[11px] font-bold uppercase tracking-wider">
              Email kamu belum terverifikasi nih sayang! Cek inbox ya? 💌
            </p>
          </div>
          <button 
            onClick={handleResend}
            disabled={loading || sent}
            className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full text-[10px] font-black text-yellow-900 uppercase hover:bg-yellow-200 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : sent ? 'Sudah dikirim! ✨' : (
              <>
                <Send className="w-3 h-3" />
                Kirim Ulang Link
              </>
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
