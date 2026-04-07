'use client';

import React from 'react';
import { VerificationBanner } from '@/components/auth/VerificationBanner';
import { BottomNav } from '@/components/layout/BottomNav';
import { NextProtectedRoute } from '@/components/layout/NextProtectedRoute';
import { FidgetPet } from '@/components/ui/FidgetPet';

/**
 * ProtectedLayout - The "Premium Shell" 🏰
 * 
 * This layout serves as the consistent frame for all authenticated routes.
 * It includes:
 * - NextProtectedRoute: Client-side session guard.
 * - VerificationBanner: Email verification status.
 * - BottomNav: Main navigation for mobile/desktop.
 * - FidgetPet: AI Assistant (Restricted to protected routes per user rule).
 */
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextProtectedRoute>
      <div className="relative min-h-screen w-full bg-[#e5f1fa]">
        {/* Top-level system alerts */}
        <VerificationBanner />
        
        {/* Main Fluid Content */}
        <main className="pb-32 md:pb-40 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
          {children}
        </main>

        {/* Global Persistence Layer */}
        <BottomNav />
        
        {/* AI Assistant - Floating Sovereign Agent */}
        <FidgetPet />
      </div>
    </NextProtectedRoute>
  );
}
