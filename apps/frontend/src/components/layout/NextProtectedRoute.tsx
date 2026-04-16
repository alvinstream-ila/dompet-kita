'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth';

/**
 * NextProtectedRoute - Client-Side Auth Guard
 * Wraps pages that require an active session.
 */
export function NextProtectedRoute({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
          className="border-deep-sea h-10 w-10 rounded-full border-4 border-t-transparent"
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
