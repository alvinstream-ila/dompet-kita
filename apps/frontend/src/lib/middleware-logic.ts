import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Dompet Kita - Sovereign Middleware Logic
 * Handles instant server-side redirection based on the auth_token cookie.
 * Ported from proxy.ts to resolve build conflicts.
 */
export function middlewareLogic(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isVerified = request.cookies.get('user_verified')?.value === 'true';
  const { pathname } = request.nextUrl;

  // 1. Define Paths
  const isAuthPage = pathname.startsWith('/auth');
  const isVerifyPage = pathname === '/auth/verify-email';
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') || // static files like favicon.ico
    pathname === '/manifest.json';

  if (isPublicAsset) return NextResponse.next();

  // 2. Logic: If no token and not on an auth page, redirect to login
  if (!token && !isAuthPage && !isVerifyPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 3. 🛡️ Verification Gatekeeper (The Most Important Logic)
  // If logged in but NOT verified, force redirect to /auth/verify-email
  if (token && !isVerified && !isVerifyPage && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/verify-email', request.url));
  }

  // 4. Logic: If token exists and user tries to access login/register, redirect to dashboard
  if (token && isAuthPage && !isVerifyPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 5. If verified and tries to access verify page, redirect to dashboard
  if (token && isVerified && isVerifyPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // 4. Security Hardening: Apply Headers
  // - CSP: Restrict resource loading to trusted domains
  const cspHeader = `
    default-src 'self';
    connect-src 'self' http://localhost:8000 https://*.railway.app https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://vercel.live wss://*.pusher.com https://*.pusher.com;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.sentry.io;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: http://localhost:8000 https://*.railway.app https://*.supabase.co;
    font-src 'self' https://fonts.gstatic.com https://vercel.live;
    frame-src 'self' https://vercel.live;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `
    .replaceAll(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}
