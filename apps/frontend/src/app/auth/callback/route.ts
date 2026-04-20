import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { serverApi } from '@/lib/server-api';

/**
 * Auth Callback Route Handler 🚀
 * Handles server-side session initialization and redirects.
 * Replaces page.tsx to avoid cookie modification errors in RSC.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const isNew = searchParams.get('is_new') === '1';

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // 1. Initialize session in cookies
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // 2. Validate token and fetch user profile
    // Note: serverApi reads from cookies() which we just set
    const user = await serverApi('/user');

    if (!user) {
      throw new Error('User not found');
    }

    // 3. Handle special onboarding flags
    if (isNew) {
      cookieStore.set('show_welcome_toast', '1', {
        expires: new Date(Date.now() + 60 * 1000), // 1 minute
        path: '/',
      });
    }

    // 4. Instant redirect to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Server-side callback error:', error);

    // Attempt to clear session on failure
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');

    return NextResponse.redirect(
      new URL('/auth/login?error=callback_failed', request.url)
    );
  }
}
