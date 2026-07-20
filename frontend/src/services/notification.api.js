import api from './axios';

export const getMyNotificationsApi = (params = {}) => api.get('/notification/', { params });

export const getUnreadCountApi = () => api.get('/notification/unread-count');

export const markNotificationReadApi = (notificationId) => api.patch(`/notification/read/${notificationId}`);

export const markAllNotificationsReadApi = () => api.patch('/notification/read-all');

export const deleteNotificationApi = (notificationId) => api.delete(`/notification/${notificationId}`);

// Admin
export const sendNotificationApi = (data) => api.post('/notification/send', data);

export const sendNotificationToAllApi = (data) => api.post('/notification/send-all', data);
