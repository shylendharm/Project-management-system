const prisma = require('../config/db');

/**
 * Fetch dashboard statistics for a given user.
 */
const getDashboardStats = async (userId) => {
  const [
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    projectsInProgress
  ] = await Promise.all([
    prisma.project.count({
      where: { userId },
    }),
    prisma.task.count({
      where: { userId },
    }),
    prisma.task.count({
      where: { userId, status: 'COMPLETED' },
    }),
    prisma.task.count({
      where: { userId, status: 'PENDING' },
    }),
    prisma.project.count({
      where: { userId, status: 'IN_PROGRESS' },
    }),
  ]);

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    projectsInProgress,
  };
};

module.exports = {
  getDashboardStats,
};
