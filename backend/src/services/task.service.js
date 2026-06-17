const prisma = require('../config/db');

/**
 * Helper to select uniform task shape.
 */
const taskSelect = () => ({
  id: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  dueDate: true,
  projectId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Create a task under a specific project, verifying the user owns the project.
 */
const createTask = async ({ title, description, priority, status, dueDate, projectId, userId }) => {
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) return null;

  return prisma.task.create({
    data: {
      title,
      description,
      priority: priority || 'MEDIUM',
      status: status || 'PENDING',
      dueDate: dueDate || null,
      projectId,
      userId,
    },
    select: taskSelect(),
  });
};

/**
 * Get all tasks for a project, verifying the user owns the project.
 * @param {number} projectId
 * @param {number} userId
 * @param {{ search?: string, status?: string, priority?: string }} filters
 */
const getTasksByProject = async (projectId, userId, { search, status, priority } = {}) => {
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) return null;

  const where = { projectId, userId };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: taskSelect(),
  });
};

/**
 * Get all tasks across all projects for a user, with optional filters.
 * @param {number} userId
 * @param {{ search?: string, status?: string, priority?: string }} filters
 */
const getAllTasks = async (userId, { search, status, priority } = {}) => {
  const where = { userId };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: taskSelect(),
  });
};

/**
 * Get a single task by ID — verifies ownership.
 */
const getTaskById = async (id, userId) => {
  return prisma.task.findFirst({
    where: { id, userId },
    select: taskSelect(),
  });
};

/**
 * Update a task — verifies ownership.
 */
const updateTask = async (id, userId, data) => {
  const existing = await prisma.task.findFirst({
    where: { id, userId },
  });
  if (!existing) return null;

  return prisma.task.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
    },
    select: taskSelect(),
  });
};

/**
 * Convenient shortcut to mark a task as COMPLETED.
 */
const markTaskComplete = async (id, userId) => {
  return updateTask(id, userId, { status: 'COMPLETED' });
};

/**
 * Delete a task — verifies ownership.
 */
const deleteTask = async (id, userId) => {
  const existing = await prisma.task.findFirst({
    where: { id, userId },
  });
  if (!existing) return null;

  return prisma.task.delete({
    where: { id },
    select: taskSelect(),
  });
};

module.exports = {
  createTask,
  getAllTasks,
  getTasksByProject,
  getTaskById,
  updateTask,
  markTaskComplete,
  deleteTask,
};
