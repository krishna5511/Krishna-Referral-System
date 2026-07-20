import api from './axios';

export const signupApi = (data) => api.post('/auth/signup', data);

export const loginApi = (data) => api.post('/auth/login', data);

export const logoutApi = () => api.post('/auth/logout');

export const googleAuthApi = (data) => api.post('/auth/google', data);

export const verifyEmailApi = (token) => api.get(`/auth/verify-email/${token}`);

export const sendVerificationEmailApi = () => api.post('/auth/send-verification-email');

export const forgotPasswordApi = (data) => api.post('/auth/forgot-password', data);

export const resetPasswordApi = (token, data) => api.post(`/auth/reset-password/${token}`, data);

export const getCurrentUserApi = () => api.get('/auth/me');
