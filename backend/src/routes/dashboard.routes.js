const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// GET /api/dashboard        → Get dashboard statistics
// GET /api/dashboard/stats  → Get dashboard statistics (alias)
router.get('/', getDashboardStats);
router.get('/stats', getDashboardStats);

module.exports = router;
