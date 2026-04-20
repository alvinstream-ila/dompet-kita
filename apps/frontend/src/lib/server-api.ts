import { cookies } from 'next/headers';

/**
 * Dompet Kita - Server API Service
 * Used in Server Actions and Server Components to talk to the backend.
 */
export async function serverApi(endpoint: string, options: RequestInit = {}) {
  let token: string | undefined;

  try {
    const cookieStore = await cookies();
    token = cookieStore.get('auth_token')?.value;
  } catch (error) {
    // During build/prerendering, cookies() might reject.
    // We treat this as no token available to prevent hanging promise crashes.
    token = undefined;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.message ||
      errorData.error ||
      `Backend Error (${response.status}): Terjadi kesalahan sistem. 🥺`;

    if (response.status !== 401) {
      console.error(
        `[ServerApi] Request failed: ${response.status} - ${message}`
      );
    }

    throw new Error(message);
  }

  return response.json();
}
