import api from './axios';

export const createTicketApi = (data) => api.post('/support/create-ticket', data);

export const getMyTicketsApi = (params = {}) => api.get('/support/my-tickets', { params });

export const getSingleTicketApi = (ticketId) => api.get(`/support/ticket/${ticketId}`);

export const replyTicketApi = (ticketId, data) => api.post(`/support/reply/${ticketId}`, data);

// Admin
export const getAllTicketsApi = (params = {}) => api.get('/support/all-tickets', { params });

export const updateTicketStatusApi = (ticketId, data) => api.patch(`/support/status/${ticketId}`, data);

export const assignTicketApi = (ticketId, data) => api.patch(`/support/assign/${ticketId}`, data);

export const deleteTicketApi = (ticketId) => api.delete(`/support/${ticketId}`);
