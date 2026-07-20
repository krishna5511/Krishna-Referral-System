import api from './axios';

export const getProfileApi = () => api.get('/user/profile');

export const updateProfileApi = (formData) =>
  api.patch('/user/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const changePasswordApi = (data) => api.patch('/user/change-password', data);

export const deleteProfileImageApi = () => api.delete('/user/profile-image');

export const deleteAccountApi = () => api.delete('/user/delete-account');
