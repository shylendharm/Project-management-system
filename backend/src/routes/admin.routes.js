const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/admin.controller');

const router = express.Router();

// Apply protect and authorize('ADMIN') to all admin endpoints
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
