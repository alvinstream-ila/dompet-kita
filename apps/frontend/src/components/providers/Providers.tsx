'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/get-query-client';
import { AuthProvider } from '@/features/auth';
import { Toaster } from 'sonner';

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  // NOTE: Avoid useState when initializing the query client if you want
  // to avoid potential issues during hydration / suspense if you don't
  // use a QueryClient singleton!
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
