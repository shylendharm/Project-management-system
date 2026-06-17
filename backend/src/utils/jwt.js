const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

/**
 * Generate a signed JWT for a user.
 * @param {number} userId
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('Server configuration error: JWT_SECRET is not set.', 500);
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

/**
 * Verify and decode a JWT.
 * Throws JsonWebTokenError or TokenExpiredError if invalid/expired.
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('Server configuration error: JWT_SECRET is not set.', 500);
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
