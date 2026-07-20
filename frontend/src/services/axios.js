import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== DEBUG =====
console.log("ENV BASE URL :", import.meta.env.VITE_API_URL);
console.log("AXIOS BASE URL :", api.defaults.baseURL);
// =================

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log("➡️ Request URL:", `${config.baseURL}${config.url}`);

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        localStorage.removeItem('token');
        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/signup') &&
          !window.location.pathname.includes('/forgot-password') &&
          !window.location.pathname.includes('/reset-password') &&
          !window.location.pathname.includes('/verify-email')
        ) {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        break;

      case 403:
        break;

      case 429:
        toast.error('Too many requests. Please wait 15 minutes.');
        break;

      case 500:
        toast.error(data?.message || 'Internal server error.');
        break;

      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default api;