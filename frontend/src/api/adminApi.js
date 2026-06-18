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
