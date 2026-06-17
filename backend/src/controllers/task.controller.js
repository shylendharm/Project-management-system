const taskService = require('../services/task.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

// ─── CREATE TASK ──────────────────────────────────────────────────────────────
const createTask = catchAsync(async (req, res, next) => {
  const task = await taskService.createTask({
    ...req.validatedBody,
    userId: req.user.id,
  });

  if (!task) {
    throw new AppError('Project not found or you do not have permission to add tasks to it', 404);
  }

  return sendSuccess(res, 'Task created successfully', task, 201);
});

// ─── GET ALL TASKS (own, cross-project) ──────────────────────────────────────
const getAllTasks = catchAsync(async (req, res, next) => {
  const { search, status, priority } = req.query;
  const tasks = await taskService.getAllTasks(req.user.id, { search, status, priority });
  
  return sendSuccess(res, 'Tasks retrieved successfully', tasks, 200, { count: tasks.length });
});

// ─── GET TASKS BY PROJECT ─────────────────────────────────────────────────────
const getTasksByProject = catchAsync(async (req, res, next) => {
  const projectId = parseInt(req.params.projectId, 10);
  if (isNaN(projectId)) {
    throw new AppError('Invalid project ID format', 400);
  }

  const { search, status, priority } = req.query;
  const tasks = await taskService.getTasksByProject(projectId, req.user.id, { search, status, priority });
  if (!tasks) {
    throw new AppError('Project not found or access denied', 404);
  }

  return sendSuccess(res, 'Tasks retrieved successfully', tasks, 200, { count: tasks.length });
});

// ─── GET TASK BY ID ───────────────────────────────────────────────────────────
const getTaskById = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new AppError('Invalid task ID format', 400);
  }

  const task = await taskService.getTaskById(id, req.user.id);
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

  const task = await taskService.updateTask(id, req.user.id, req.validatedBody);
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

  const task = await taskService.markTaskComplete(id, req.user.id);
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

  const task = await taskService.deleteTask(id, req.user.id);
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
