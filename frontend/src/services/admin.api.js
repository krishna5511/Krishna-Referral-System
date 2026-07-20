import api from './axios';

export const getAdminDashboardApi = () => api.get('/admin/dashboard');

export const getAllUsersApi = (params = {}) => api.get('/admin/users', { params });

export const getSingleUserApi = (userId) => api.get(`/admin/users/${userId}`);

export const blockUserApi = (userId) => api.patch(`/admin/users/block/${userId}`);

export const unblockUserApi = (userId) => api.patch(`/admin/users/unblock/${userId}`);

export const deleteUserApi = (userId) => api.delete(`/admin/users/${userId}`);

export const getAnalyticsApi = () => api.get('/admin/analytics');

export const getAdminLeaderboardApi = (params = {}) => api.get('/admin/leaderboard', { params });
