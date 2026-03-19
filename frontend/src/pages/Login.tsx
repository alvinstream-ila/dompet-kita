import React, { useState } from 'react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, LogIn, User, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";

const CustomLogo: React.FC = () => (
  <div className="w-9 h-9 md:w-12 md:h-12 relative flex items-center justify-center p-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-sm border border-white/50">
    <img src="/logo-utama.svg" alt="Dompet Kita Logo" className="w-full h-full object-contain" />
  </div>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z" />
    <path fill="#34A853" d="M16.04 18.013c-1.09.613-2.346.987-3.791.987-2.73 0-5.06-1.745-6.142-4.168l-4.015 3.109C4.305 21.282 7.9 24 12 24c3.08 0 5.86-1.06 8.01-2.85l-3.97-3.137z" />
    <path fill="#4285F4" d="M19.834 24c2.618-2.175 4.166-5.4 4.166-9.109a15.8 15.8 0 0 0-.25-2.891H12v5.474h6.758c-.312 1.625-1.196 3.012-2.344 3.79l3.96 3.14c.14.11.28.22.42.33C21.78 22.1 22 20.6 22 19.1c0-1-.3-1.9-.8-2.7z" />
    <path fill="#FBBC05" d="M5.266 14.235a7.1 7.1 0 0 1-.36-2.235c0-.78.13-1.53.36-2.235L1.24 6.65A11.96 11.96 0 0 0 0 12c0 1.92.44 3.73 1.22 5.34l4.046-3.105z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#1877F2] fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Login: React.FC = () => {
  const { login: setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  React.useEffect(() => {
    console.log('Build Version: af66315-fix-v2');
  }, []);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    
    try {
      if (isForgotPassword) {
        const { data } = await api.post('/forgot-password', { email });
        setSuccessMessage(data.message);
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const { data } = await api.post('/register', { name, email, password });
        setSuccessMessage(data.message);
        setIsSignUp(false); 
      } else {
        const { data } = await api.post('/login', { email, password });
        setAuthData(data.access_token, data.user);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 
        (isForgotPassword ? 'Gagal kirim link, coba lagi ya sayang? ❤️' : 
         isSignUp ? 'Gagal daftar, Sayang. Cek lagi datanya ya? ❤️' : 
         'Email atau password salah, Sayang. Coba lagi ya? ❤️');
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-transparent font-inter">
      {/* Top Branding Area */}
      <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 flex items-center gap-3 z-20">
         <CustomLogo />
         <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter leading-none text-left">Dompet Kita</h1>
            <span className="text-[12px] font-script text-pink-500 drop-shadow-sm transform -rotate-1">Financial Planner</span>
         </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[400px] relative z-50"
      >
        {/* Main Card */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[48px] border border-white/60 shadow-2xl p-8 pt-12 md:p-10 md:pt-14 relative overflow-hidden z-50">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={isForgotPassword ? 'forgot' : isSignUp ? 'signup' : 'login'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 relative z-50"
            >
              {/* Header Icon & Title */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white/90 backdrop-blur-xl rounded-[28px] shadow-xl border border-white flex items-center justify-center mb-6 transform hover:rotate-6 transition-transform cursor-pointer group">
                  {isForgotPassword ? (
                    <Lock className="w-10 h-10 text-yellow-500 group-hover:scale-110 transition-transform" />
                  ) : isSignUp ? (
                    <User className="w-10 h-10 text-pink-500 group-hover:scale-110 transition-transform" />
                  ) : (
                    <LogIn className="w-10 h-10 text-slate-900 group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center uppercase">
                  {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create New Account' : 'Sign In With Email'}
                </h2>
                <p className="text-slate-600 font-bold text-[12px] text-center mt-1 uppercase tracking-wider">
                   {isForgotPassword ? 'Biar Kami Bantu Ingat Kembali' : isSignUp ? 'Join Us To Start Managing Better' : 'Make Your Dream Come True With Planning Your Finance'}
                </p>
              </div>

              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-bold text-emerald-700 leading-relaxed">
                    {successMessage}
                  </p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Your Panggilan Sayang" 
                      className="w-full h-14 bg-slate-200/50 border-none rounded-full pl-14 pr-6 font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full h-14 bg-slate-200/50 border-none rounded-full pl-14 pr-6 font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {!isForgotPassword && (
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="w-full h-14 bg-slate-200/50 border-none rounded-full pl-14 pr-6 font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!isForgotPassword}
                    />
                  </div>
                )}

                {!isSignUp && !isForgotPassword && (
                  <div className="flex justify-end pr-4">
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[11px] font-black text-slate-800 hover:text-blue-600 transition-colors uppercase tracking-tight"
                    >
                      Forgot Password ?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className={clsx(
                    "w-full h-14 rounded-full text-white font-black text-lg tracking-tight shadow-xl transition-all active:scale-[0.98] uppercase mt-2",
                    isSignUp ? "bg-pink-500 hover:bg-pink-600 shadow-pink-500/30" : 
                    isForgotPassword ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30 text-slate-900" :
                    "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                  )}
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 
                   (isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Log In')}
                </Button>
              </form>

              {/* Mode Switcher */}
              <div className="text-center pt-2 pb-4">
                <button 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setIsForgotPassword(false);
                  }}
                  className="text-[11px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-all"
                >
                  {isForgotPassword ? 'Sudah Ingat? Masuk Lagi' : isSignUp ? 'Sudah Punya Akun? Masuk Di Sini' : 'Belum Punya Akun? Daftar Sekarang'}
                </button>
                {isForgotPassword && (
                  <button 
                    onClick={() => setIsForgotPassword(false)}
                    className="block mx-auto mt-4 text-[11px] font-black text-slate-400 hover:text-slate-800 uppercase tracking-widest transition-all"
                  >
                    Batal
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Social Auth - Outside Animation Container for better stability */}
          <div className="mt-4 pt-6 border-t border-slate-200/50 relative z-[200]">
            <div className="flex flex-col items-center gap-6">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Or {isSignUp ? 'sign up' : 'sign in'} with</p>
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => {
                    const apiUrl = import.meta.env.VITE_API_URL || 'https://dompet-kita-official.up.railway.app/api';
                    window.location.href = `${apiUrl}/auth/google`;
                  }}
                  className="w-[84px] h-[72px] bg-slate-100/80 hover:bg-white rounded-[28px] border border-slate-200/50 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-md relative z-[300]"
                >
                  <GoogleIcon />
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    const apiUrl = import.meta.env.VITE_API_URL || 'https://dompet-kita-official.app/api';
                    window.location.href = `${apiUrl}/auth/facebook`;
                  }}
                  className="w-[84px] h-[72px] bg-slate-100/80 hover:bg-white rounded-[28px] border border-slate-200/50 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-md relative z-[300]"
                >
                  <FacebookLogo />
                </button>
                <button 
                  type="button" 
                  className="w-[84px] h-[72px] bg-slate-100/80 hover:bg-white rounded-[28px] border border-slate-200/50 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-md relative z-[300]"
                >
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

// Simple helper for class names
function clsx(...args: any[]) {
    return args.filter(Boolean).join(' ');
}

export default Login;
