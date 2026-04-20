import axios from 'axios';
import Cookies from 'js-cookie';

import { useSudoStore } from '@/features/auth/hooks/useSudoStore';

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

// Interceptor for Authentication Errors (Handle 401 & Sudo 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // 🛡️ Handle Sudo Required (403 sudo_required)
    if (
      error.response?.status === 403 &&
      error.response?.data?.sudo_required &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      return new Promise((resolve) => {
        useSudoStore.getState().openSudo(() => {
          // Setelah re-auth sukses di modal, panggil ulang request asli
          resolve(api(originalRequest));
        });
      });
    }

    if (error.response?.status === 401) {
      // Sovereign Force Logout: Jika server menolak token, hapus jejak lokal
      Cookies.remove('auth_token');
      Cookies.remove('user_verified');

      // Gunakan optional chaining dan direct undefined check untuk kepatuhan linting maksimal
      const location = globalThis.window?.location;
      if (location !== undefined) {
        if (!location.pathname.includes('/login')) {
          location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
