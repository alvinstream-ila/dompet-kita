import axios from 'axios';

/**
 * Dompet Kita - API Service
 * Centralized instance for talking to the Laravel Backend.
 */
const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || 'https://dompet-kita-production.up.railway.app/api',
  baseURL: 'https://dompet-kita-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Required for Sanctum CSRF protection
});

// Interceptor for Authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
