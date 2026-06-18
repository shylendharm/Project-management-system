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
 * Create a task under a specific project, verifying the user owns the project (unless admin).
 */
const createTask = async ({ title, description, priority, status, dueDate, projectId, userId }, isAdmin = false) => {
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: isAdmin ? { id: projectId } : { id: projectId, userId },
  });
  if (!project) return null;

  const targetUserId = isAdmin ? project.userId : userId;

  return prisma.task.create({
    data: {
      title,
      description,
      priority: priority || 'MEDIUM',
      status: status || 'PENDING',
      dueDate: dueDate || null,
      projectId,
      userId: targetUserId,
    },
    select: taskSelect(),
  });
};

/**
 * Get all tasks for a project, verifying the user owns the project.
 * @param {number} projectId
 * @param {number} userId
 * @param {{ search?: string, status?: string, priority?: string, page?: number, limit?: number, sortBy?: string, order?: string }} filters
 * @param {boolean} isAdmin
 * @returns {{ data: Task[], total: number } | null}
 */
const getTasksByProject = async (projectId, userId, { search, status, priority, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = {}, isAdmin = false) => {
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: isAdmin ? { id: projectId } : { id: projectId, userId },
  });
  if (!project) return null;

  const where = isAdmin ? { projectId } : { projectId, userId };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'status', 'priority', 'dueDate'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip,
      take: limit,
      select: taskSelect(),
    }),
    prisma.task.count({ where }),
  ]);

  return { data, total };
};

/**
 * Get all tasks across all projects for a user, with optional filters and pagination.
 * @param {number} userId
 * @param {{ search?: string, status?: string, priority?: string, page?: number, limit?: number, sortBy?: string, order?: string }} filters
 * @param {boolean} isAdmin
 * @returns {{ data: Task[], total: number }}
 */
const getAllTasks = async (userId, { search, status, priority, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = {}, isAdmin = false) => {
  const where = isAdmin ? {} : { userId };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'status', 'priority', 'dueDate'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip,
      take: limit,
      select: taskSelect(),
    }),
    prisma.task.count({ where }),
  ]);

  return { data, total };
};

/**
 * Get a single task by ID — verifies ownership unless admin.
 */
const getTaskById = async (id, userId, isAdmin = false) => {
  const where = isAdmin ? { id } : { id, userId };
  return prisma.task.findFirst({
    where,
    select: taskSelect(),
  });
};

/**
 * Update a task — verifies ownership unless admin.
 */
const updateTask = async (id, userId, data, isAdmin = false) => {
  const where = isAdmin ? { id } : { id, userId };
  const existing = await prisma.task.findFirst({
    where,
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
const markTaskComplete = async (id, userId, isAdmin = false) => {
  return updateTask(id, userId, { status: 'COMPLETED' }, isAdmin);
};

/**
 * Delete a task — verifies ownership unless admin.
 */
const deleteTask = async (id, userId, isAdmin = false) => {
  const where = isAdmin ? { id } : { id, userId };
  const existing = await prisma.task.findFirst({
    where,
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
