import axiosInstance from './axiosInstance';

export const registerUser = (data) => axiosInstance.post('/auth/register', data);
export const loginUser    = (data) => axiosInstance.post('/auth/login', data);
export const logoutUser   = ()     => axiosInstance.post('/auth/logout');
export const getMe        = ()     => axiosInstance.get('/auth/me');
