const prisma = require('../config/db');

/**
 * Fetch dashboard statistics for a given user.
 */
const getDashboardStats = async (userId, userRole) => {
  const now = new Date();

  const projectWhere = userRole === 'ADMIN' ? {} : { userId };
  const taskWhere = userRole === 'ADMIN' ? {} : { userId };

  const [
    totalProjects,
    totalTasks,
    inProgressTasks,
    overdueTasks,
    recentProjects,
    recentTasks
  ] = await Promise.all([
    prisma.project.count({
      where: projectWhere,
    }),
    prisma.task.count({
      where: taskWhere,
    }),
    prisma.task.count({
      where: { ...taskWhere, status: 'IN_PROGRESS' },
    }),
    prisma.task.count({
      where: {
        ...taskWhere,
        status: { not: 'COMPLETED' },
        dueDate: { lt: now },
      },
    }),
    prisma.project.findMany({
      where: projectWhere,
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        tasks: true,
      },
    }),
    prisma.task.findMany({
      where: taskWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        project: true,
      },
    }),
  ]);

  return {
    totalProjects,
    totalTasks,
    inProgressTasks,
    overdueTasks,
    recentProjects,
    recentTasks,
  };
};

/**
 * Fetch notifications for a user based on their role.
 */
const getNotifications = async (userId, userRole) => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const isAdmin = userRole === 'ADMIN';
  const taskWhere = isAdmin ? {} : { userId };
  const projectWhere = isAdmin ? {} : { userId };

  const notifications = [];

  // ── Overdue tasks ──
  const overdueTasks = await prisma.task.findMany({
    where: {
      ...taskWhere,
      status: { not: 'COMPLETED' },
      dueDate: { lt: now },
    },
    take: 5,
    orderBy: { dueDate: 'asc' },
    include: { project: { select: { name: true } } },
  });

  for (const task of overdueTasks) {
    notifications.push({
      id: `overdue-${task.id}`,
      type: 'danger',
      icon: '⚠️',
      title: 'Overdue Task',
      message: `"${task.title}" is overdue${
        task.project ? ` in ${task.project.name}` : ''
      }`,
      time: task.dueDate,
    });
  }

  // ── Tasks due soon (within 3 days) ──
  const dueSoonTasks = await prisma.task.findMany({
    where: {
      ...taskWhere,
      status: { not: 'COMPLETED' },
      dueDate: { gte: now, lte: threeDaysFromNow },
    },
    take: 4,
    orderBy: { dueDate: 'asc' },
    include: { project: { select: { name: true } } },
  });

  for (const task of dueSoonTasks) {
    const diffMs = new Date(task.dueDate) - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const timeLabel = diffDays > 0 ? `in ${diffDays} day${diffDays > 1 ? 's' : ''}` : `in ${diffHrs}h`;
    notifications.push({
      id: `due-soon-${task.id}`,
      type: 'warning',
      icon: '🕐',
      title: 'Due Soon',
      message: `"${task.title}" is due ${timeLabel}${
        task.project ? ` · ${task.project.name}` : ''
      }`,
      time: task.dueDate,
    });
  }

  // ── Admin-only: recently created projects ──
  if (isAdmin) {
    const newProjects = await prisma.project.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, email: true } } },
    });
    for (const project of newProjects) {
      notifications.push({
        id: `new-project-${project.id}`,
        type: 'info',
        icon: '📁',
        title: 'New Project Created',
        message: `"${project.name}" by ${
          project.user?.fullName || project.user?.email || 'Unknown'
        }`,
        time: project.createdAt,
      });
    }

    // ── Admin-only: high-priority incomplete tasks ──
    const highPriorityTasks = await prisma.task.findMany({
      where: {
        priority: 'HIGH',
        status: { not: 'COMPLETED' },
        createdAt: { gte: oneDayAgo },
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { name: true } } },
    });
    for (const task of highPriorityTasks) {
      notifications.push({
        id: `high-priority-${task.id}`,
        type: 'warning',
        icon: '🔥',
        title: 'High Priority Task',
        message: `"${task.title}"${
          task.project ? ` in ${task.project.name}` : ''
        } needs attention`,
        time: task.createdAt,
      });
    }
  }

  // Sort by time descending
  notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

  return notifications;
};

module.exports = {
  getDashboardStats,
  getNotifications,
};
