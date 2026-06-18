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
 * Get all projects that belong to a specific user (or all projects if admin), with optional filters and pagination.
 * @param {number} userId
 * @param {{ search?: string, status?: string, page?: number, limit?: number, sortBy?: string, order?: string }} filters
 * @param {boolean} isAdmin
 * @returns {{ data: Project[], total: number }}
 */
const getAllProjects = async (userId, { search, status, page = 1, limit = 9, sortBy = 'createdAt', order = 'desc' } = {}, isAdmin = false) => {
  const where = isAdmin ? {} : { userId };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Whitelist sortable fields to prevent injection
  const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'status', 'startDate', 'endDate'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip,
      take: limit,
      select: projectSelect(),
    }),
    prisma.project.count({ where }),
  ]);

  return { data, total };
};

/**
 * Get a single project by ID — verifies ownership unless admin.
 */
const getProjectById = async (id, userId, isAdmin = false) => {
  const where = isAdmin ? { id } : { id, userId };
  return prisma.project.findFirst({
    where,
    select: projectSelect(),
  });
};

/**
 * Update a project — verifies ownership unless admin.
 */
const updateProject = async (id, userId, data, isAdmin = false) => {
  // Confirm this project belongs to the user (or is accessed by admin)
  const where = isAdmin ? { id } : { id, userId };
  const existing = await prisma.project.findFirst({ where });
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
 * Delete a project — verifies ownership unless admin.
 */
const deleteProject = async (id, userId, isAdmin = false) => {
  const where = isAdmin ? { id } : { id, userId };
  const existing = await prisma.project.findFirst({ where });
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
