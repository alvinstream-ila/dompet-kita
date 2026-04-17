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

// Interceptor for Authentication
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
