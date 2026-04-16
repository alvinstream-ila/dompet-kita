'use client';

import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import api from '@/lib/axios';

/**
 * AuthCallbackContent - Inner component to use useSearchParams() safely within Suspense.
 */
function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams?.get('token');

      if (token) {
        try {
          // Temporarily set token to fetch user data
          Cookies.set('auth_token', token, {
            expires: 7,
            sameSite: 'lax',
            secure: true,
          });
          const { data: user } = await api.get('/user');

          // Properly authorize via context
          login(token, user);

          // Check if this is a new signup to show premium onboarding toast
          if (searchParams?.get('is_new') === '1') {
            Cookies.set('show_welcome_toast', '1', { expires: 1 / 1440 }); // Lives for 1 minute
          }

          // Redirect to home/dashboard
          router.push('/');
        } catch (error) {
          console.error('Callback error', error);
          Cookies.remove('auth_token');
          router.push('/auth/login?error=callback_failed');
        }
      } else {
        router.push('/auth/login');
      }
    };

    if (searchParams) {
      handleCallback();
    }
  }, [searchParams, router, login]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="relative">
        <div className="bg-blue-royal/10 absolute inset-0 animate-pulse rounded-full blur-2xl" />
        <Loader2 className="text-blue-royal relative h-16 w-16 animate-spin" />
      </div>
      <p className="animate-pulse text-[12px] font-black tracking-[0.2em] text-slate-600 uppercase">
        Lagi menyambungkan diri sayang...
      </p>
    </div>
  );
}

/**
 * Auth Callback Page - Main Entry
 */
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="text-blue-royal h-10 w-10 animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
