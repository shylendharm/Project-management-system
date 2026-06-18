const taskService = require('../services/task.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

// ─── CREATE TASK ──────────────────────────────────────────────────────────────
const createTask = catchAsync(async (req, res, next) => {
  const isAdmin = req.user.role === 'ADMIN';
  const task = await taskService.createTask({
    ...req.validatedBody,
    userId: req.user.id,
  }, isAdmin);

  if (!task) {
    throw new AppError('Project not found or you do not have permission to add tasks to it', 404);
  }

  return sendSuccess(res, 'Task created successfully', task, 201);
});

// ─── GET ALL TASKS (own, cross-project or all if admin) ───────────────────────
const getAllTasks = catchAsync(async (req, res, next) => {
  const { search, status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;
  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const isAdmin = req.user.role === 'ADMIN';

  const { data, total } = await taskService.getAllTasks(req.user.id, { search, status, priority, page, limit, sortBy, order }, isAdmin);
  const totalPages = Math.ceil(total / limit);

  return sendSuccess(res, 'Tasks retrieved successfully', data, 200, {
    total,
    totalPages,
    currentPage: page,
    limit,
  });
});

// ─── GET TASKS BY PROJECT ─────────────────────────────────────────────────────────
const getTasksByProject = catchAsync(async (req, res, next) => {
  const projectId = parseInt(req.params.projectId, 10);
  if (isNaN(projectId)) {
    throw new AppError('Invalid project ID format', 400);
  }

  const { search, status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;
  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const isAdmin = req.user.role === 'ADMIN';

  const result = await taskService.getTasksByProject(projectId, req.user.id, { search, status, priority, page, limit, sortBy, order }, isAdmin);
  if (!result) {
    throw new AppError('Project not found or access denied', 404);
  }

  const { data, total } = result;
  const totalPages = Math.ceil(total / limit);

  return sendSuccess(res, 'Tasks retrieved successfully', data, 200, {
    total,
    totalPages,
    currentPage: page,
    limit,
  });
});

// ─── GET TASK BY ID ───────────────────────────────────────────────────────────
const getTaskById = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new AppError('Invalid task ID format', 400);
  }

  const isAdmin = req.user.role === 'ADMIN';
  const task = await taskService.getTaskById(id, req.user.id, isAdmin);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return sendSuccess(res, 'Task retrieved successfully', task);
});

// ─── UPDATE TASK ──────────────────────────────────────────────────────────────
const updateTask = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new AppError('Invalid task ID format', 400);
  }

  const isAdmin = req.user.role === 'ADMIN';
  const task = await taskService.updateTask(id, req.user.id, req.validatedBody, isAdmin);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return sendSuccess(res, 'Task updated successfully', task);
});

// ─── MARK TASK COMPLETE ───────────────────────────────────────────────────────
const markTaskComplete = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new AppError('Invalid task ID format', 400);
  }

  const isAdmin = req.user.role === 'ADMIN';
  const task = await taskService.markTaskComplete(id, req.user.id, isAdmin);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return sendSuccess(res, 'Task marked as completed', task);
});

// ─── DELETE TASK ──────────────────────────────────────────────────────────────
const deleteTask = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new AppError('Invalid task ID format', 400);
  }

  const isAdmin = req.user.role === 'ADMIN';
  const task = await taskService.deleteTask(id, req.user.id, isAdmin);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return sendSuccess(res, 'Task deleted successfully');
});

module.exports = {
  createTask,
  getAllTasks,
  getTasksByProject,
  getTaskById,
  updateTask,
  markTaskComplete,
  deleteTask,
};
