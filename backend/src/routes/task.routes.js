const express = require('express');
const {
  createTask,
  getAllTasks,
  getTasksByProject,
  getTaskById,
  updateTask,
  markTaskComplete,
  deleteTask,
} = require('../controllers/task.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { createTaskSchema, updateTaskSchema } = require('../validators/task.validator');

const router = express.Router();

// All task routes require authentication
router.use(protect);

// POST   /api/tasks                     → Create a new task
// GET    /api/tasks?search=&status=&priority=  → Get all user's tasks (with optional filters)
router.route('/')
  .post(validateBody(createTaskSchema), createTask)
  .get(getAllTasks);

// GET    /api/tasks/project/:projectId  → Get tasks within a project
router.route('/project/:projectId')
  .get(getTasksByProject);

// GET    /api/tasks/:id                 → Get single task
// PUT    /api/tasks/:id                 → Update task
// DELETE /api/tasks/:id                 → Delete task
router.route('/:id')
  .get(getTaskById)
  .put(validateBody(updateTaskSchema), updateTask)
  .delete(deleteTask);

// PUT    /api/tasks/:id/complete        → Mark task as completed
router.route('/:id/complete')
  .put(markTaskComplete);

module.exports = router;
