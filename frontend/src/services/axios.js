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

// Request interceptor — attach token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
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
        // Token expired or missing
        localStorage.removeItem('token');
        // Dispatch logout if not already on auth pages
        if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/signup') &&
            !window.location.pathname.includes('/forgot-password') &&
            !window.location.pathname.includes('/reset-password') &&
            !window.location.pathname.includes('/verify-email')) {
          // We'll handle this in the auth slice
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        break;
      case 403:
        // Blocked or forbidden - don't toast, let component handle
        break;
      case 429:
        toast.error('Too many requests. Please wait 15 minutes.');
        break;
      case 500:
        toast.error(data?.message || 'Internal server error. Please try again.');
        break;
      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default api;
