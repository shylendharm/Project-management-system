import axiosInstance from './axiosInstance';

export const getTasks          = (params)            => axiosInstance.get('/tasks', { params });
export const getTasksByProject = (projectId, params) => axiosInstance.get(`/tasks/project/${projectId}`, { params });

export const getTask           = (id)           => axiosInstance.get(`/tasks/${id}`);
export const createTask        = (data)         => axiosInstance.post('/tasks', data);
export const updateTask        = (id, data)     => axiosInstance.put(`/tasks/${id}`, data);
export const markComplete      = (id)           => axiosInstance.put(`/tasks/${id}/complete`);
export const deleteTask        = (id)           => axiosInstance.delete(`/tasks/${id}`);
