import arcjet, { detectBot, fixedWindow, shield } from '@arcjet/next';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { middlewareLogic } from '@/lib/middleware-logic';

// 🛡️ Initialize Arcjet
const aj = arcjet({
  key: process.env.ARCJET_KEY ?? '', // Key from your .env file
  characteristics: ['ip.src'], // Track requests by IP address
  rules: [
    // 1. Shield: Protect against common attacks like SQLi/XSS
    shield({
      mode: 'LIVE', // Blocks requests that match the rules
    }),
    // 2. Bot Detection: Block non-browser traffic (AI scrapers, search bots, etc.)
    detectBot({
      mode: 'LIVE', // Blocks requests from detected bots
      // Allow specific bots if needed (e.g. search engine crawlers)
      allow: ['CATEGORY:SEARCH_ENGINE'],
    }),
    // 3. Rate Limiting: Prevent brute-force on auth endpoints
    fixedWindow({
      mode: 'LIVE',
      window: '1m', // 1 minute window
      max: 30, // Max 30 requests per minute
    }),
  ],
});

/**
 * Dompet Kita - Sovereign Sentinel Middleware
 * Integrates Arcjet Security with custom Auth Proxy logic.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip security for public assets and static files
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') ||
    pathname === '/manifest.json';

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // 🛡️ SECURITY GATE - ARCJET
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    } else if (decision.reason.isBot()) {
      return NextResponse.json({ error: 'Bot access denied' }, { status: 403 });
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  }

  // 🚪 APP LOGIC - AUTH MIDDLEWARE
  return middlewareLogic(request);
}

// Config for matching paths (must strictly avoid API and static files)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes handled by Laravel)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
