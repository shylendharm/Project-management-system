const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Helper to generate authorization and content-type headers.
 */
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Helper to handle response.
 */
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.errors = data.errors || null;
    throw error;
  }
  return data;
};

/**
 * Create a new task.
 */
export const createTask = async (taskData) => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(taskData),
  });
  return handleResponse(response);
};

/**
 * Get all tasks for a specific project.
 */
export const getTasks = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get a single task by ID.
 */
export const getTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

/**
 * Update a task.
 */
export const updateTask = async (id, taskData) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(taskData),
  });
  return handleResponse(response);
};

/**
 * Mark a task as complete.
 */
export const markTaskComplete = async (id) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
    method: 'PUT',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

/**
 * Delete a task.
 */
export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};
