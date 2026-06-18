const prisma = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');
const { logAction } = require('../services/auditLog.service');

// ─── GET ALL USERS ────────────────────────────────────────────────────────────
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          projects: true,
          tasks: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return sendSuccess(res, 'Users retrieved successfully', users);
});

// ─── UPDATE USER ROLE ──────────────────────────────────────────────────────────
const updateUserRole = catchAsync(async (req, res, next) => {
  const userId = parseInt(req.params.id, 10);
  const { role } = req.body;

  if (isNaN(userId)) {
    throw new AppError('Invalid user ID format', 400);
  }

  if (!role || !['ADMIN', 'USER'].includes(role)) {
    throw new AppError('Invalid role. Role must be ADMIN or USER', 400);
  }

  // Prevent self demotion
  if (req.user.id === userId && role !== 'ADMIN') {
    throw new AppError('You cannot demote yourself from ADMIN', 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });

  await logAction(req.user.id, 'USER_ROLE_CHANGED', `User ${userId} role changed to ${role}`);
  return sendSuccess(res, 'User role updated successfully', updatedUser);
});

// ─── DELETE USER ──────────────────────────────────────────────────────────────
const deleteUser = catchAsync(async (req, res, next) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    throw new AppError('Invalid user ID format', 400);
  }

  // Prevent self deletion
  if (req.user.id === userId) {
    throw new AppError('You cannot delete yourself', 400);
  }

  // Clean up user's data (tasks, projects) then user in a transaction
  await prisma.$transaction([
    prisma.task.deleteMany({ where: { userId } }),
    prisma.project.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  await logAction(req.user.id, 'USER_DELETED', `User ID ${userId} and all their data deleted`);
  return sendSuccess(res, 'User and all their projects/tasks deleted successfully');
});

// ─── GET AUDIT LOGS ───────────────────────────────────────────────────────────
const getLogs = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    }),
    prisma.auditLog.count(),
  ]);

  return sendSuccess(res, 'Audit logs retrieved', logs, 200, {
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
  });
});

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getLogs,
};
