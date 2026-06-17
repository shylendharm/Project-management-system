const projectService = require('../services/project.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

// ─── CREATE PROJECT ───────────────────────────────────────────────────────────
const createProject = catchAsync(async (req, res, next) => {
  const project = await projectService.createProject({
    ...req.validatedBody,
    userId: req.user.id,
  });

  return sendSuccess(res, 'Project created successfully', project, 201);
});

// ─── GET ALL PROJECTS (own) ───────────────────────────────────────────────────
const getAllProjects = catchAsync(async (req, res, next) => {
  const { search, status } = req.query;
  const projects = await projectService.getAllProjects(req.user.id, { search, status });
  
  return sendSuccess(res, 'Projects retrieved successfully', projects, 200, { count: projects.length });
});

// ─── GET SINGLE PROJECT ───────────────────────────────────────────────────────
const getProjectById = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new AppError('Invalid project ID format', 400);
  }

  const project = await projectService.getProjectById(id, req.user.id);
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

  const project = await projectService.updateProject(id, req.user.id, req.validatedBody);
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

  const deleted = await projectService.deleteProject(id, req.user.id);
  if (!deleted) {
    throw new AppError('Project not found', 404);
  }

  return sendSuccess(res, 'Project deleted successfully');
});

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
