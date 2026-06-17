const dashboardService = require('../services/dashboard.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/responseHandler');

// ─── GET DASHBOARD STATS ──────────────────────────────────────────────────────
const getDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await dashboardService.getDashboardStats(req.user.id);
  return sendSuccess(res, 'Dashboard statistics retrieved successfully', stats);
});

module.exports = {
  getDashboardStats,
};
