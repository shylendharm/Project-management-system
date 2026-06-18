const projectService = require('../services/project.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');
const { logAction } = require('../services/auditLog.service');

// ─── CREATE PROJECT ───────────────────────────────────────────────────────────
const createProject = catchAsync(async (req, res, next) => {
  const project = await projectService.createProject({
    ...req.validatedBody,
    userId: req.user.id,
  });
  await logAction(req.user.id, 'PROJECT_CREATED', `Project "${project.name}" created`);

  return sendSuccess(res, 'Project created successfully', project, 201);
});

// ─── GET ALL PROJECTS (own or all if admin) ───────────────────────────────────
const getAllProjects = catchAsync(async (req, res, next) => {
  const { search, status, sortBy = 'createdAt', order = 'desc' } = req.query;
  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 9));
  const isAdmin = req.user.role === 'ADMIN';

  const { data, total } = await projectService.getAllProjects(req.user.id, { search, status, page, limit, sortBy, order }, isAdmin);
  const totalPages = Math.ceil(total / limit);

  return sendSuccess(res, 'Projects retrieved successfully', data, 200, {
    total,
    totalPages,
    currentPage: page,
    limit,
  });
});

// ─── GET SINGLE PROJECT ───────────────────────────────────────────────────────
const getProjectById = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new AppError('Invalid project ID format', 400);
  }

  const isAdmin = req.user.role === 'ADMIN';
  const project = await projectService.getProjectById(id, req.user.id, isAdmin);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return sendSuccess(res, 'Project retrieved successfully', project);
});

// ─── UPDATE PROJECT ───────────────────────────────────────────────────────────
const updateProject = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new AppError('Invalid project ID format', 400);
  }

  const isAdmin = req.user.role === 'ADMIN';
  const project = await projectService.updateProject(id, req.user.id, req.validatedBody, isAdmin);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return sendSuccess(res, 'Project updated successfully', project);
});

// ─── DELETE PROJECT ───────────────────────────────────────────────────────────
const deleteProject = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new AppError('Invalid project ID format', 400);
  }

  const isAdmin = req.user.role === 'ADMIN';
  const deleted = await projectService.deleteProject(id, req.user.id, isAdmin);
  if (!deleted) {
    throw new AppError('Project not found', 404);
  }
  await logAction(req.user.id, 'PROJECT_DELETED', `Project ID ${id} deleted`);

  return sendSuccess(res, 'Project deleted successfully');
});

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
