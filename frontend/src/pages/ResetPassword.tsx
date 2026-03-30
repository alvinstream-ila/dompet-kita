import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { Lock, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
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
        password_confirmation: passwordConfirmation
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Gagal reset password sayang, linknya mungkin sudah basi. Coba minta lagi ya? ❤️';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <p className="text-slate-600 font-bold mb-4">Linknya nggak lengkap nih sayang. 🥺</p>
          <Button onClick={() => navigate('/login')}>Kembali ke Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[32px] shadow-2xl p-8 md:p-10 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-[20px] flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Password Baru</h1>
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mt-1">Ganti password kamu biar aman ya sayang</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-bold text-emerald-700">Password berhasil diganti! Terimakasih sayang ❤️</p>
            <p className="text-sm text-slate-500">Otomatis ke halaman login sebentar lagi...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-bold">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="new-password" className="text-[11px] font-black text-slate-400 uppercase ml-4">Password Baru</label>
              <input 
                id="new-password"
                type="password"
                placeholder="Password minimal 8 karakter"
                className="w-full h-14 bg-slate-100 border-none rounded-full px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirm-password" className="text-[11px] font-black text-slate-400 uppercase ml-4">Konfirmasi Password</label>
              <input 
                id="confirm-password"
                type="password"
                placeholder="Ketik ulang passwordnya"
                className="w-full h-14 bg-slate-100 border-none rounded-full px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-full shadow-lg shadow-blue-500/30 uppercase mt-4"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Ganti Password Sekarang'}
            </Button>

            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase transition-colors pt-2"
            >
              <ArrowLeft className="w-3 h-3" />
              Batal
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
