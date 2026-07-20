import api from './axios';

export const getReferralDashboardApi = () => api.get('/referral/dashboard');

export const getMyReferralLinkApi = () => api.get('/referral/my-link');

export const getMyReferralsApi = (params = {}) => api.get('/referral/my-referrals', { params });

export const getReferralStatsApi = () => api.get('/referral/stats');

export const getLeaderboardApi = (params = {}) => api.get('/referral/leaderboard', { params });
