import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { CheckCircle, XCircle, Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const url = searchParams.get('url');
      if (!url) {
        setStatus('error');
        setMessage('Link verifikasinya nggak ada nih sayang, coba cek emailnya lagi ya? 🥺');
        return;
      }

      try {
        // The URL from Laravel usually contains the full signed URL
        await api.get(url);
        setStatus('success');
        setMessage('Email kamu sudah terverifikasi! Sekarang kita bisa lanjut nabung bareng ya sayang! ✨');
        setTimeout(() => navigate('/'), 3000);
      } catch (error) {
        setStatus('error');
        const errorMsg = (error as any).response?.data?.message || 'Gagal memverifikasi email, coba minta link baru ya sayang? ❤️';
        setMessage(errorMsg);
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[32px] shadow-xl p-8 text-center border border-slate-100"
      >
        <div className="flex flex-col items-center">
          {status === 'loading' ? (
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
          ) : status === 'success' ? (
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-rose-600" />
            </div>
          )}

          <h1 className="text-2xl font-black text-slate-800 mb-2">Verifikasi Email</h1>
          <p className="text-slate-600 font-bold text-sm mb-6 leading-relaxed">
            {message || 'Sabar ya sayang, lagi dicek sebentar...'}
          </p>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-pink-500 font-script text-xl italic">
              <Heart className="w-5 h-5 fill-current" />
              <span>Redirecting home...</span>
            </div>
          )}

          {status === 'error' && (
            <button 
              onClick={() => navigate('/login')}
              className="px-8 h-12 bg-slate-800 text-white font-black rounded-full hover:bg-slate-900 transition-colors"
            >
              Kembali ke Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
