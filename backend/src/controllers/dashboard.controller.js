const dashboardService = require('../services/dashboard.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/responseHandler');

// ─── GET DASHBOARD STATS ──────────────────────────────────────────────────────
const getDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await dashboardService.getDashboardStats(req.user.id, req.user.role);
  return sendSuccess(res, 'Dashboard statistics retrieved successfully', stats);
});

// ─── GET NOTIFICATIONS ────────────────────────────────────────────────────────
const getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await dashboardService.getNotifications(req.user.id, req.user.role);
  return sendSuccess(res, 'Notifications retrieved successfully', notifications);
});

module.exports = {
  getDashboardStats,
  getNotifications,
};
