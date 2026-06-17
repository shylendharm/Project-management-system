const express = require('express');
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/project.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { createProjectSchema, updateProjectSchema } = require('../validators/project.validator');

const router = express.Router();

// All project routes require authentication
router.use(protect);

// POST   /api/projects         → Create a new project
// GET    /api/projects         → Get all own projects
router.route('/')
  .post(validateBody(createProjectSchema), createProject)
  .get(getAllProjects);

// GET    /api/projects/:id     → Get single project
// PUT    /api/projects/:id     → Update project
// DELETE /api/projects/:id     → Delete project
router.route('/:id')
  .get(getProjectById)
  .put(validateBody(updateProjectSchema), updateProject)
  .delete(deleteProject);

module.exports = router;
