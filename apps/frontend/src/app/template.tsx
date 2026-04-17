'use client';

import { motion } from 'framer-motion';
import type React from 'react';

/**
 * Global Page Transition Template 🎬
 *
 * Next.js 'template' components wrap every page and re-mount on navigation,
 * allowing for entry/exit animations between sibling routes.
 */
export default function Template({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1], // Custom premium cubic-bezier
      }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
