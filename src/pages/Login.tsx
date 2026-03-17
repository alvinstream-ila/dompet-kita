import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Facebook, Loader2, ArrowRight, User, MailCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const CustomLogo: React.FC = () => (
  <div className="w-9 h-9 md:w-12 md:h-12 relative flex items-center justify-center p-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-sm border border-white/50">
    <img src="/logo-utama.svg" alt="Dompet Kita Logo" className="w-full h-full object-contain" />
  </div>
);

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              display_name: displayName,
            }
          }
        });
        if (error) throw error;
        setShowEmailSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      alert('Tolong masukkan email Anda terlebih dahulu!');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      if (error) throw error;
      setShowEmailSent(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat login sosial.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center relative font-body p-4 z-10 overflow-hidden bg-transparent">
        
        {/* Compact Logo Section */}
        <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 flex items-center gap-3 z-20">
           <CustomLogo />
           <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter leading-none">Dompet Kita</h1>
              <span className="text-[12px] font-script text-pink-500 drop-shadow-sm transform -rotate-1">Financial Planner</span>
           </div>
        </div>

        {/* Compact Form Container */}
        <div className="w-full max-w-[380px] z-20 mt-8">
          <motion.div
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             transition={{ duration: 0.5, ease: "easeOut" }}
             className="relative"
          >
            {/* Dynamic Entry Icon - Compact */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 glass rounded-2xl flex items-center justify-center border-2 border-white/80 shadow-xl z-30 transition-transform active:scale-90">
              <ArrowRight className={cn("w-6 h-6 text-slate-900 transition-transform duration-500", isSignUp ? "-rotate-90" : "rotate-0")} />
            </div>

            <div className="glass rounded-[40px] border border-white/60 shadow-2xl overflow-hidden pt-12 pb-8 relative">
              <div className="px-6 md:px-10 text-center">
                <div className="space-y-1 mb-8">
                  <h2 className="text-[20px] md:text-[22px] font-black text-slate-900 tracking-tighter uppercase leading-tight">
                    {showEmailSent ? 'Cek Email Kamu ✨' : (isSignUp ? 'Buat Akun' : 'Selamat Datang')}
                  </h2>
                  <p className="text-slate-700 text-[11px] md:text-[12px] font-bold opacity-80 leading-snug">
                    {showEmailSent ? 'Link konfirmasi rahasia sudah meluncur!' : (isSignUp ? 'Mulai rencanakan masa depanmu' : 'Atur keuanganmu dengan lebih cerdas')}
                  </p>
                </div>

                {showEmailSent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-6 flex flex-col items-center gap-6"
                  >
                    <div className="w-20 h-20 bg-blue-50 rounded-[30px] flex items-center justify-center text-blue-500 shadow-inner">
                      <MailCheck className="w-10 h-10" />
                    </div>
                    
                    <div className="bg-white/50 border border-white/80 p-5 rounded-2xl shadow-sm">
                      <p className="text-slate-600 text-[13px] font-bold leading-relaxed">
                        Kami sudah mengirimkan link ke: <br/>
                        <span className="text-slate-900 font-black tracking-tight">{email}</span>
                      </p>
                      <p className="text-slate-400 text-[11px] font-medium mt-3 italic">
                        Jangan lupa cek folder spam juga ya jika tidak ada di inbox utama.
                      </p>
                    </div>

                    <Button 
                      onClick={() => setShowEmailSent(false)}
                      variant="outline"
                      className="w-full h-11 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all"
                    >
                      KEMBALI KE LOGIN
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <form onSubmit={handleAuth} className="space-y-4">
                      {isSignUp && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-1.5 text-left"
                        >
                          <Label className="text-[9px] font-black text-slate-800 uppercase tracking-widest px-1">Nama Panggilan</Label>
                          <div className="relative group">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-slate-900 transition-colors" />
                            <Input 
                              type="text" 
                              placeholder="Misal: Alvin atau Ila" 
                              className="h-11 bg-white/60 border-white/40 rounded-xl pl-11 text-[13px] font-bold focus-visible:ring-slate-400/20 focus-visible:bg-white/90 transition-all placeholder:text-slate-400"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              required={isSignUp}
                            />
                          </div>
                        </motion.div>
                      )}

                      <div className="space-y-1.5 text-left">
                        <Label className="text-[9px] font-black text-slate-800 uppercase tracking-widest px-1">Alamat Email</Label>
                        <div className="relative group">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-slate-900 transition-colors" />
                          <Input 
                            type="email" 
                            placeholder="nama@email.com" 
                            className="h-11 bg-white/60 border-white/40 rounded-xl pl-11 text-[13px] font-bold focus-visible:ring-slate-400/20 focus-visible:bg-white/90 transition-all placeholder:text-slate-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <Label className="text-[9px] font-black text-slate-800 uppercase tracking-widest px-1">Kata Sandi</Label>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-slate-900 transition-colors" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-11 bg-white/60 border-white/40 rounded-xl pl-11 text-[13px] font-bold focus-visible:ring-slate-400/20 focus-visible:bg-white/90 transition-all placeholder:text-slate-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {!isSignUp && (
                        <div className="text-right">
                          <Button variant="link" className="text-[9px] font-black text-slate-600 hover:text-slate-900 uppercase tracking-wide h-auto p-0 transition-colors"> Lupa Kata Sandi? </Button>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-[12px] tracking-widest transition-all shadow-lg active:scale-95 uppercase mt-2"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSignUp ? 'Buat Akun' : 'Masuk Aplikasi')}
                      </Button>
                    </form>

                    {/* Social Logins Compact */}
                    <div className="mt-8">
                      <div className="relative mb-6">
                          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-900/10" /></div>
                          <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.2em]"><span className="bg-transparent px-3 text-slate-500">Atau Gunakan</span></div>
                      </div>

                    <div className="flex justify-center gap-5">
                      <motion.div whileHover={{ y: -5, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          type="button"
                          onClick={() => handleSocialAuth('google')}
                          variant="outline" 
                          size="icon" 
                          className="w-12 h-12 bg-white/50 border-white/60 rounded-2xl shadow-sm hover:bg-white hover:border-red-100 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                          </svg>
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ y: -5, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          type="button"
                          onClick={() => handleSocialAuth('facebook')}
                          variant="outline" 
                          size="icon" 
                          className="w-12 h-12 bg-white/50 border-white/60 rounded-2xl shadow-sm hover:bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                        >
                          <Facebook className="w-5 h-5 text-[#1877F2]" />
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ y: -5, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          type="button"
                          onClick={handleMagicLink} 
                          variant="outline" 
                          size="icon" 
                          className="w-12 h-12 bg-white/50 border-white/60 rounded-2xl shadow-sm hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300"
                        >
                          <Mail className="w-5 h-5 text-slate-700" />
                        </Button>
                      </motion.div>
                    </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-900/5">
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-slate-600 hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.15em] transition-all h-auto p-0"
                      >
                        {isSignUp ? 'Sudah Ada Akun? Masuk' : 'Belum Ada Akun? Daftar'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
    </div>
  );
};

export default Login;
