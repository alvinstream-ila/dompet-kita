import { cookies } from 'next/headers';

/**
 * Dompet Kita - Server API Service
 * Used in Server Actions and Server Components to talk to the backend.
 */
export async function serverApi(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

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
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}
