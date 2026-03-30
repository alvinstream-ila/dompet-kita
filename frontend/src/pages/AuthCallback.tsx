import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');

      if (token) {
        try {
          // Temporarily set token to fetch user data
          localStorage.setItem('auth_token', token);
          const { data: user } = await api.get('/user');

          // Properly authorize via context
          login(token, user);
          navigate('/');
        } catch (error) {
          console.error('Callback error', error);
          localStorage.removeItem('auth_token');
          navigate('/login?error=callback_failed');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      <p className="text-[12px] font-black tracking-widest text-slate-600 uppercase">
        Lagi menyambungkan diri sayang...
      </p>
    </div>
  );
};

export default AuthCallback;
