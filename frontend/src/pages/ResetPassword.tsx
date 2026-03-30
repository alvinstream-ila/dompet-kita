import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { Lock, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg =
        err.response?.data?.message ||
        'Gagal reset password sayang, linknya mungkin sudah basi. Coba minta lagi ya? ❤️';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <p className="mb-4 font-bold text-slate-600">
            Linknya nggak lengkap nih sayang. 🥺
          </p>
          <Button onClick={() => navigate('/login')}>Kembali ke Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[32px] border border-slate-100 bg-white p-8 shadow-2xl md:p-10"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-yellow-100">
            <Lock className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Password Baru</h1>
          <p className="mt-1 text-[12px] font-bold tracking-wider text-slate-500 uppercase">
            Ganti password kamu biar aman ya sayang
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="font-bold text-emerald-700">
              Password berhasil diganti! Terimakasih sayang ❤️
            </p>
            <p className="text-sm text-slate-500">
              Otomatis ke halaman login sebentar lagi...
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] font-bold text-rose-600">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="new-password"
                className="ml-4 text-[11px] font-black text-slate-400 uppercase"
              >
                Password Baru
              </label>
              <input
                id="new-password"
                type="password"
                placeholder="Password minimal 8 karakter"
                className="h-14 w-full rounded-full border-none bg-slate-100 px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="confirm-password"
                className="ml-4 text-[11px] font-black text-slate-400 uppercase"
              >
                Konfirmasi Password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Ketik ulang passwordnya"
                className="h-14 w-full rounded-full border-none bg-slate-100 px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-4 h-14 w-full rounded-full bg-blue-500 font-black text-white uppercase shadow-lg shadow-blue-500/30 hover:bg-blue-600"
            >
              {loading ? (
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              ) : (
                'Ganti Password Sekarang'
              )}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/login')}
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
};

export default ResetPassword;
