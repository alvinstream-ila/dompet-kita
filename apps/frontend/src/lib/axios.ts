import axios from 'axios';
import Cookies from 'js-cookie';

/**
 * Dompet Kita - API Service
 * Centralized instance for talking to the Laravel Backend.
 * 🛡️ Secured with Unkey API Key for backend access verification.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // Unkey Secure Handshake: proves this request comes from our frontend
    'x-api-key': process.env.NEXT_PUBLIC_UNKEY_CLIENT_KEY ?? '',
  },
  withCredentials: true, // Required for Sanctum CSRF protection
});

// Interceptor for Authentication (Inject Token)
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for Authentication Errors (Handle 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sovereign Force Logout: Jika server menolak token, hapus jejak lokal
      Cookies.remove('auth_token');
      Cookies.remove('user_verified');

      // Gunakan typeof window yang aman untuk SSR/Build environment
      if (typeof window !== 'undefined' && window.location) {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
