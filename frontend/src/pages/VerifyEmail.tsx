import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { CheckCircle, XCircle, Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const url = searchParams.get('url');
      if (!url) {
        setStatus('error');
        setMessage(
          'Link verifikasinya nggak ada nih sayang, coba cek emailnya lagi ya? 🥺'
        );
        return;
      }

      try {
        // The URL from Laravel usually contains the full signed URL
        await api.get(url);
        setStatus('success');
        setMessage(
          'Email kamu sudah terverifikasi! Sekarang kita bisa lanjut nabung bareng ya sayang! ✨'
        );
        setTimeout(() => navigate('/'), 3000);
      } catch (error: unknown) {
        setStatus('error');
        const err = error as { response?: { data?: { message?: string } } };
        const errorMsg =
          err.response?.data?.message ||
          'Gagal memverifikasi email, coba minta link baru ya sayang? ❤️';
        setMessage(errorMsg);
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-xl"
      >
        <div className="flex flex-col items-center">
          {status === 'loading' ? (
            <Loader2 className="mb-6 h-16 w-16 animate-spin text-blue-500" />
          ) : status === 'success' ? (
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
          ) : (
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
              <XCircle className="h-10 w-10 text-rose-600" />
            </div>
          )}

          <h1 className="mb-2 text-2xl font-black text-slate-800">
            Verifikasi Email
          </h1>
          <p className="mb-6 text-sm leading-relaxed font-bold text-slate-600">
            {message || 'Sabar ya sayang, lagi dicek sebentar...'}
          </p>

          {status === 'success' && (
            <div className="font-script flex items-center gap-2 text-xl text-pink-500 italic">
              <Heart className="h-5 w-5 fill-current" />
              <span>Redirecting home...</span>
            </div>
          )}

          {status === 'error' && (
            <button
              onClick={() => navigate('/login')}
              className="h-12 rounded-full bg-slate-800 px-8 font-black text-white transition-colors hover:bg-slate-900"
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
