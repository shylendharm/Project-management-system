import axiosInstance from './axiosInstance';

export const getUsers = () => {
  return axiosInstance.get('/admin/users');
};

export const updateUserRole = (id, role) => {
  return axiosInstance.put(`/admin/users/${id}/role`, { role });
};

export const deleteUser = (id) => {
  return axiosInstance.delete(`/admin/users/${id}`);
};

export const getLogs = (page = 1, limit = 20) => {
  return axiosInstance.get(`/admin/logs?page=${page}&limit=${limit}`);
};
