'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { Toaster } from 'sonner';
import { AuthProvider, GlobalSudoModal } from '@/features/auth';
import { getQueryClient } from '@/lib/get-query-client';

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // NOTE: Avoid useState when initializing the query client if you want
  // to avoid potential issues during hydration / suspense if you don't
  // use a QueryClient singleton!
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <GlobalSudoModal />
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
