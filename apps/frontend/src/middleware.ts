import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Dompet Kita - Sovereign Middleware
 * Handles instant server-side redirection based on the auth_token cookie.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Define Public and Auth paths
  const isAuthPage = pathname.startsWith('/auth');
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') || // static files like favicon.ico
    pathname === '/manifest.json';

  if (isPublicAsset) return NextResponse.next();

  // 2. Logic: If no token and not on an auth page, redirect to login
  if (!token && !isAuthPage) {
    const loginUrl = new URL('/auth/login', request.url);
    // Optional: save the intended destination to redirect back after login
    // loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Logic: If token exists and user tries to access login/register, redirect to dashboard
  if (token && isAuthPage && !pathname.includes('/verify')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // 4. Security Hardening: Apply Headers
  // - CSP: Restrict resource loading to trusted domains
  const cspHeader = `
    default-src 'self';
    connect-src 'self' http://localhost:8000 https://*.railway.app https://*.supabase.co https://*.sentry.io https://vercel.live wss://*.pusher.com https://*.pusher.com;
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

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
