import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/server-api';

/**
 * Auth Callback Page - Server Side Handler 🚀
 *
 * This version performs all token validation and session initialization
 * on the server, eliminating the client-side loading waterfall.
 */
export default async function AuthCallbackPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const token =
    typeof searchParams.token === 'string' ? searchParams.token : null;
  const isNew = searchParams.is_new === '1';

  if (!token) {
    redirect('/auth/login');
  }

  try {
    // 1. Initialize session in cookies immediately for subsequent server-side calls
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // 2. Validate token and fetch user profile on the server
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
    redirect('/');
  } catch (error) {
    console.error('Server-side callback error:', error);
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    redirect('/auth/login?error=callback_failed');
  }
}
