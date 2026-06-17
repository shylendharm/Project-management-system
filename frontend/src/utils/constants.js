// Project status
export const PROJECT_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

// Task status
export const TASK_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

// Task priority
export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

export const PROJECT_STATUS_OPTIONS = Object.values(PROJECT_STATUS);
export const TASK_STATUS_OPTIONS    = Object.values(TASK_STATUS);
export const TASK_PRIORITY_OPTIONS  = Object.values(TASK_PRIORITY);

export const API_BASE = '/api';
