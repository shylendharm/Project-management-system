const logger = require('../config/logger');

// Centralized global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log full error internally for investigation
  logger.error(err.stack || err);

  // Zod validation handler
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // Prisma database unique constraint violations
  if (err.code === 'P2002') {
    const fields = err.meta && err.meta.target ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this value already exists (duplicate: ${fields}).`,
    });
  }

  // Prisma record not found (e.g. update/delete target not found)
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: err.meta?.cause || 'Record not found.',
    });
  }

  // Prisma foreign key constraint violation
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Database relationship constraint violation.',
    });
  }

  // JWT validation errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired. Please sign in again.',
    });
  }

  // Handle known/operational application errors safely
  if (err.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Fallback for internal system errors
  const showDetailedError = process.env.NODE_ENV !== 'production';
  return res.status(error.statusCode).json({
    success: false,
    message: showDetailedError ? error.message : 'Internal server error',
    ...(showDetailedError && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
