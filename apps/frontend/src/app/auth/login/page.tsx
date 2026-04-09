'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/axios';
import { useAuth } from '@/features/auth';
import { Mail, Lock, Loader2, LogIn, User, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type AuthMode = 'forgot' | 'signup' | 'login' | '2fa';

const CustomLogo: React.FC = () => (
  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/50 bg-white/95 p-1.5 shadow-sm backdrop-blur-md md:h-12 md:w-12">
    <Image
      src="/logo-utama.svg"
      alt="Dompet Kita Logo"
      fill
      className="object-contain"
    />
  </div>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6">
    <path
      fill="#EA4335"
      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"
    />
    <path
      fill="#34A853"
      d="M16.04 18.013c-1.09.613-2.346.987-3.791.987-2.73 0-5.06-1.745-6.142-4.168l-4.015 3.109C4.305 21.282 7.9 24 12 24c3.08 0 5.86-1.06 8.01-2.85l-3.97-3.137z"
    />
    <path
      fill="#4285F4"
      d="M19.834 24c2.618-2.175 4.166-5.4 4.166-9.109a15.8 15.8 0 0 0-.25-2.891H12v5.474h6.758c-.312 1.625-1.196 3.012-2.344 3.79l3.96 3.14c.14.11.28.22.42.33C21.78 22.1 22 20.6 22 19.1c0-1-.3-1.9-.8-2.7z"
    />
    <path
      fill="#FBBC05"
      d="M5.266 14.235a7.1 7.1 0 0 1-.36-2.235c0-.78.13-1.53.36-2.235L1.24 6.65A11.96 11.96 0 0 0 0 12c0 1.92.44 3.73 1.22 5.34l4.046-3.105z"
    />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current text-[#1877F2]">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

/**
 * Login Page - Sovereign Entry Boundary 🔐
 */
export default function LoginPage() {
  const router = useRouter();
  const { login: setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [is2faMode, setIs2faMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getMode = (): AuthMode => {
    if (isForgotPassword) return 'forgot';
    if (is2faMode) return '2fa';
    if (isSignUp) return 'signup';
    return 'login';
  };
  const mode = getMode();

  const handleAuth = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);

    try {
      if (isForgotPassword) {
        const { data } = await api.post('/forgot-password', { email });
        setSuccessMessage(data.message);
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      } else if (isSignUp) {
        const { data } = await api.post('/register', { name, email, password });
        setSuccessMessage(data.message);
        setIsSignUp(false);
      } else if (is2faMode) {
        const { data } = await api.post('/verify-2fa', {
          email,
          code: twoFactorCode,
        });
        setAuthData(data.access_token, data.user);
      } else {
        const { data } = await api.post('/login', { email, password });
        if (data.two_factor_required) {
          setIs2faMode(true);
          setSuccessMessage(data.message);
        } else {
          setAuthData(data.access_token, data.user);
        }
      }
    } catch (error: unknown) {
      const defaultErrors: Record<AuthMode, string> = {
        forgot: 'Gagal kirim link, coba lagi ya sayang? ❤️',
        signup: 'Gagal daftar, Sayang. Cek lagi datanya ya? ❤️',
        login: 'Email atau password salah, Sayang. Coba lagi ya? ❤️',
        '2fa': 'Kode keamanan salah atau sudah kadaluarsa, Sayang. ❤️',
      };

      let message = defaultErrors[mode];

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        message = axiosError.response?.data?.message || message;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'facebook') => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    globalThis.location.href = `${apiUrl}/auth/${provider}`;
  };

  return (
    <div className="font-inter relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-transparent p-4 pb-12">
      <Branding />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-50 w-full max-w-[400px]"
      >
        <div className="relative z-50 overflow-hidden rounded-[48px] border border-white/60 bg-white/40 p-8 pt-12 shadow-2xl backdrop-blur-2xl md:p-10 md:pt-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative z-50 space-y-6"
            >
              <AuthHeader mode={mode} />

              <SuccessAlert message={successMessage} />

              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <AuthInput
                    icon={<User className="h-5 w-5" />}
                    placeholder="Your Panggilan Sayang"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    focusColor="pink"
                  />
                )}

                <AuthInput
                  icon={<Mail className="h-5 w-5" />}
                  placeholder="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  focusColor="blue"
                  disabled={is2faMode}
                />

                {!isForgotPassword && !is2faMode && (
                  <AuthInput
                    icon={<Lock className="h-5 w-5" />}
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    focusColor="blue"
                  />
                )}

                {is2faMode && (
                  <AuthInput
                    icon={<Lock className="h-5 w-5" />}
                    placeholder="6-Digit Security Code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    required
                    focusColor="pink"
                  />
                )}

                {!isSignUp && !isForgotPassword && !is2faMode && (
                  <div className="flex justify-end pr-4">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[11px] font-black tracking-tight text-slate-800 uppercase transition-colors hover:text-blue-600"
                    >
                      Forgot Password ?
                    </button>
                  </div>
                )}

                <SubmitButton loading={loading} mode={mode} />
              </form>

              <ModeSwitcher
                mode={mode}
                is2faMode={is2faMode}
                setIs2faMode={setIs2faMode}
                setTwoFactorCode={setTwoFactorCode}
                setSuccessMessage={setSuccessMessage}
                onSignUpToggle={() => {
                  setIsSignUp(!isSignUp);
                  setIsForgotPassword(false);
                }}
                onCancelForgot={() => setIsForgotPassword(false)}
              />
            </motion.div>
          </AnimatePresence>

          <SocialAuth isSignUp={isSignUp} handleSocialAuth={handleSocialAuth} />
        </div>
      </motion.div>
    </div>
  );
}

// ----- Subcomponents -----

const Branding = () => (
  <div className="absolute top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 md:top-8 md:left-8 md:translate-x-0">
    <CustomLogo />
    <div className="flex flex-col">
      <h1 className="text-left text-lg leading-none font-black tracking-tighter text-slate-900 md:text-xl">
        Dompet Kita
      </h1>
      <span className="font-script -rotate-1 transform text-[12px] text-pink-500 drop-shadow-sm">
        Financial Planner
      </span>
    </div>
  </div>
);

const AuthHeader = ({ mode }: { mode: AuthMode }) => {
  const config: Record<
    AuthMode,
    { icon: React.ReactNode; title: string; sub: string }
  > = {
    forgot: {
      icon: (
        <Lock className="h-10 w-10 text-yellow-500 transition-transform group-hover:scale-110" />
      ),
      title: 'Reset Password',
      sub: 'Biar Kami Bantu Ingat Kembali',
    },
    signup: {
      icon: (
        <User className="h-10 w-10 text-pink-500 transition-transform group-hover:scale-110" />
      ),
      title: 'Create New Account',
      sub: 'Join Us To Start Managing Better',
    },
    login: {
      icon: (
        <LogIn className="h-10 w-10 text-slate-900 transition-transform group-hover:scale-110" />
      ),
      title: 'Sign In With Email',
      sub: 'Make Your Dream Come True With Planning Your Finance',
    },
    '2fa': {
      icon: (
        <Lock className="h-10 w-10 text-pink-500 transition-transform group-hover:scale-110" />
      ),
      title: 'Security Verification',
      sub: 'Cek Email Kamu Buat Kode Aman Ya Sayang! ❤️',
    },
  };

  const { icon, title, sub } = config[mode];

  return (
    <div className="flex flex-col items-center">
      <div className="group mb-6 flex h-20 w-20 transform cursor-pointer items-center justify-center rounded-[28px] border border-white bg-white/90 shadow-xl backdrop-blur-xl transition-transform hover:rotate-6">
        {icon}
      </div>
      <h2 className="text-center text-2xl font-black tracking-tight text-slate-800 uppercase">
        {title}
      </h2>
      <p className="mt-1 text-center text-[12px] font-bold tracking-wider text-slate-600 uppercase">
        {sub}
      </p>
    </div>
  );
};

const SuccessAlert = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle className="h-4 w-4" />
      </div>
      <p className="text-[11px] leading-relaxed font-bold text-emerald-700">
        {message}
      </p>
    </motion.div>
  );
};

const AuthInput = ({
  icon,
  placeholder,
  type = 'text',
  value,
  onChange,
  required,
  focusColor,
  disabled,
}: {
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  focusColor: string;
  disabled?: boolean;
}) => {
  const ringColor =
    focusColor === 'pink' ? 'focus:ring-pink-500/20' : 'focus:ring-blue-500/20';
  const iconColor =
    focusColor === 'pink'
      ? 'group-focus-within:text-pink-500'
      : 'group-focus-within:text-blue-500';

  return (
    <div className="group relative">
      <div
        className={cn(
          'absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 transition-colors',
          iconColor
        )}
      >
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className={cn(
          'h-14 w-full rounded-full border-none bg-slate-200/50 pr-6 pl-14 font-bold text-slate-700 transition-all outline-none placeholder:text-slate-400',
          'focus:ring-4',
          ringColor
        )}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

const SubmitButton = ({
  loading,
  mode,
}: {
  loading: boolean;
  mode: AuthMode;
}) => {
  const config: Record<AuthMode, { bg: string; label: string }> = {
    forgot: {
      bg: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30 text-slate-900',
      label: 'Send Reset Link',
    },
    signup: {
      bg: 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30 text-white',
      label: 'Create Account',
    },
    login: {
      bg: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30 text-white',
      label: 'Log In',
    },
    '2fa': {
      bg: 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30 text-white',
      label: 'Verify Code',
    },
  };

  const { bg, label } = config[mode];

  return (
    <Button
      type="submit"
      disabled={loading}
      className={cn(
        'mt-2 h-14 w-full rounded-full text-lg font-black tracking-tight uppercase shadow-xl transition-all active:scale-[0.98]',
        bg
      )}
    >
      {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : label}
    </Button>
  );
};

const ModeSwitcher = ({
  mode,
  is2faMode,
  setIs2faMode,
  setTwoFactorCode,
  setSuccessMessage,
  onSignUpToggle,
  onCancelForgot,
}: {
  mode: AuthMode;
  is2faMode: boolean;
  setIs2faMode: (val: boolean) => void;
  setTwoFactorCode: (val: string) => void;
  setSuccessMessage: (val: string | null) => void;
  onSignUpToggle: () => void;
  onCancelForgot: () => void;
}) => {
  const labels: Record<AuthMode, string> = {
    forgot: 'Sudah Ingat? Masuk Lagi',
    signup: 'Sudah Punya Akun? Masuk Di Sini',
    login: 'Belum Punya Akun? Daftar Sekarang',
    '2fa': 'Bukan Akun Kamu? Masuk Lagi',
  };

  return (
    <div className="pt-2 pb-4 text-center">
      <button
        onClick={onSignUpToggle}
        className="text-[11px] font-black tracking-widest text-slate-500 uppercase transition-all hover:text-slate-900"
      >
        {labels[mode]}
      </button>
      {is2faMode && (
        <button
          onClick={() => {
            setIs2faMode(false);
            setTwoFactorCode('');
            setSuccessMessage(null);
          }}
          className="mx-auto mt-4 block text-[11px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-800"
        >
          Batal & Reset Login
        </button>
      )}
      {mode === 'forgot' && (
        <button
          onClick={onCancelForgot}
          className="mx-auto mt-4 block text-[11px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-800"
        >
          Batal
        </button>
      )}
    </div>
  );
};

const SocialAuth = ({
  isSignUp,
  handleSocialAuth,
}: {
  isSignUp: boolean;
  handleSocialAuth: (p: 'google' | 'facebook') => void;
}) => (
  <div className="relative z-0 mt-4 border-t border-slate-200/50 pt-6">
    <div className="flex flex-col items-center gap-6">
      <p className="text-[11px] font-black tracking-widest text-slate-600 uppercase">
        Or {isSignUp ? 'sign up' : 'sign in'} with
      </p>
      <div className="flex items-center gap-4">
        <SocialButton
          onClick={() => handleSocialAuth('google')}
          icon={<GoogleIcon />}
        />
        <SocialButton
          onClick={() => handleSocialAuth('facebook')}
          icon={<FacebookLogo />}
        />
      </div>
    </div>
  </div>
);

const SocialButton = ({
  onClick,
  icon,
}: {
  onClick: () => void;
  icon: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-[72px] w-[84px] cursor-pointer items-center justify-center rounded-[28px] border border-slate-200/50 bg-slate-100/80 shadow-sm transition-all hover:bg-white hover:shadow-md active:scale-95"
  >
    {icon}
  </button>
);
