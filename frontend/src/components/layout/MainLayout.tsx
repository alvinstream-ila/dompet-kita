import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from './BottomNav';
import { Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const FidgetPet = lazy(() =>
  import('../ui/FidgetPet').then((m) => ({ default: m.FidgetPet }))
);

interface MainLayoutProps {
  children?: React.ReactNode;
}

import { VerificationBanner } from '../auth/VerificationBanner';

export const MainLayout = React.memo(({ children }: MainLayoutProps) => {
  return (
    <div className="relative min-h-screen w-full">
      <VerificationBanner />
      {/* Page Content with Entry Animation */}
      <AnimatePresence mode="wait">
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.35,
            ease: 'easeOut',
          }}
          className="transform-gpu pb-32"
        >
          {children || <Outlet />}
        </motion.main>
      </AnimatePresence>

      {/* Persistent Navigation */}
      <BottomNav />

      {/* Interactive Fidget Pet */}
      <Suspense fallback={null}>
        <FidgetPet />
      </Suspense>
    </div>
  );
});

MainLayout.displayName = 'MainLayout';
