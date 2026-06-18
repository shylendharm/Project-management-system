const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.validatedBody);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.validatedBody);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

const getMe = async (req, res, next) => {
  try {
    // req.user is already populated by the protect middleware
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
