/**
 * AppError — Typed, operational HTTP error.
 *
 * isOperational = true  → known, safe error → message shown to client
 * isOperational = false → programming error → generic "Something went wrong" shown
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 409, 500, etc.)
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Preserve correct stack trace (excludes constructor from trace)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
