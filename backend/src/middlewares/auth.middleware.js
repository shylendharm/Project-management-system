const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('Not authorized, no token provided', 401));
    }

    const decoded = verifyToken(token);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, fullName: true, email: true } // Exclude password
    });

    if (!user) {
      return next(new AppError('Not authorized, user not found', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Not authorized, token expired', 401));
    }
    return next(new AppError('Not authorized, token failed', 401));
  }
};

module.exports = {
  protect,
};
