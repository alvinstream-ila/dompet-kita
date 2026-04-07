'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { Loader2 } from 'lucide-react';
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
          localStorage.setItem('auth_token', token);
          const { data: user } = await api.get('/user');

          // Properly authorize via context
          login(token, user);
          
          // Redirect to home/dashboard
          router.push('/');
        } catch (error) {
          console.error('Callback error', error);
          localStorage.removeItem('auth_token');
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#e5f1fa]">
      <div className="relative">
        <div className="absolute inset-0 blur-2xl bg-blue-400/20 rounded-full animate-pulse" />
        <Loader2 className="relative h-16 w-16 animate-spin text-blue-500" />
      </div>
      <p className="text-[12px] font-black tracking-[0.2em] text-slate-600 uppercase animate-pulse">
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
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#e5f1fa]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
