import axios from 'axios';
import Cookies from 'js-cookie';

/**
 * Dompet Kita - API Service
 * Centralized instance for talking to the Laravel Backend.
 */
const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    'https://dompet-kita-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
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
