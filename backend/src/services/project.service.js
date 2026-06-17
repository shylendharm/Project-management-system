const prisma = require('../config/db');

/**
 * Create a new project owned by a user.
 */
const createProject = async ({ name, description, status, startDate, endDate, userId }) => {
  return prisma.project.create({
    data: {
      name,
      description,
      status: status || 'NOT_STARTED',
      startDate: startDate || null,
      endDate: endDate || null,
      userId,
    },
    select: projectSelect(),
  });
};

/**
 * Get all projects that belong to a specific user, with optional filters.
 * @param {number} userId
 * @param {{ search?: string, status?: string }} filters
 */
const getAllProjects = async (userId, { search, status } = {}) => {
  const where = { userId };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.project.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: projectSelect(),
  });
};

/**
 * Get a single project by ID — verifies ownership.
 */
const getProjectById = async (id, userId) => {
  return prisma.project.findFirst({
    where: { id, userId },
    select: projectSelect(),
  });
};

/**
 * Update a project — verifies ownership before updating.
 */
const updateProject = async (id, userId, data) => {
  // Confirm this project belongs to the user
  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.project.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
    },
    select: projectSelect(),
  });
};

/**
 * Delete a project — verifies ownership before deleting.
 */
const deleteProject = async (id, userId) => {
  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.project.delete({ where: { id } });
};

/**
 * Shared select shape — keeps response consistent.
 */
const projectSelect = () => ({
  id: true,
  name: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
