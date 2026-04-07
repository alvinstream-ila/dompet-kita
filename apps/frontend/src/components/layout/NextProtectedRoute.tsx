'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NextProtectedRoute - Client-Side Auth Guard
 * Wraps pages that require an active session.
 */
export function NextProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      // Store current path for post-login redirect if needed
      router.push(`/auth/login?redirect=${pathname}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  // Loading indicator for authentication check
  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5f1fa]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 border-4 border-deep-sea border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
