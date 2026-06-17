const express = require('express');
const { register, login, logout, getMe } = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rateLimiter');
const { validateBody } = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
