/**
 * Centralized API response helper for consistent JSON structures.
 */
const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  return res.status(statusCode).json({
    success,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  });
};

const sendSuccess = (res, message = 'Success', data = null, statusCode = 200, meta = null) => {
  return sendResponse(res, statusCode, true, message, data, meta);
};

const sendError = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== null && { errors }),
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
