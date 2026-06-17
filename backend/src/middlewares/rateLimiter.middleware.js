// Re-export from rateLimiter.js for compatibility
const { authLimiter, globalLimiter } = require('./rateLimiter');

module.exports = { authLimiter, globalLimiter };
