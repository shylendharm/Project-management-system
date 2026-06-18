import axiosInstance from './axiosInstance';

export const getDashboardStats   = ()  => axiosInstance.get('/dashboard/stats');
export const getNotifications    = ()  => axiosInstance.get('/dashboard/notifications');
