import api from './axios';

export const requestWithdrawalApi = (data) => api.post('/withdrawal/request', data);

export const getMyWithdrawalsApi = () => api.get('/withdrawal/history');

export const cancelWithdrawalApi = (withdrawalId) => api.patch(`/withdrawal/cancel/${withdrawalId}`);

// Admin
export const getAllWithdrawalsApi = (params = {}) => api.get('/withdrawal/all', { params });

export const approveWithdrawalApi = (withdrawalId) => api.patch(`/withdrawal/approve/${withdrawalId}`);

export const rejectWithdrawalApi = (withdrawalId, data) => api.patch(`/withdrawal/reject/${withdrawalId}`, data);

export const markWithdrawalPaidApi = (withdrawalId) => api.patch(`/withdrawal/paid/${withdrawalId}`);
