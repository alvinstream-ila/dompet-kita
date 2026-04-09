import React from 'react';

/**
 * AuthLayout - Shell for login, register, and recovery pages. 🔐
 *
 * Provides the consistent "Global Background" (bubbles/gradients)
 * that defines the entry experience of Dompet Kita.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Isolated Login Background */}
      <div className="auth-bg-shell" aria-hidden="true" />

      {/* Content Layer */}
      <main className="relative z-0">{children}</main>
    </div>
  );
}
