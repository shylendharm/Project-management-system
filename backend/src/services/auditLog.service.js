const prisma = require('../config/db');

/**
 * Write an audit log entry.
 * @param {number} userId - ID of the user performing the action.
 * @param {string} action - Short action label e.g. 'PROJECT_CREATED'.
 * @param {string} [details] - Optional human-readable detail string.
 */
const logAction = async (userId, action, details = null) => {
  try {
    await prisma.auditLog.create({
      data: { userId, action, details },
    });
  } catch (err) {
    // Non-fatal – never let audit logging crash the main request
    console.error('[AuditLog] Failed to write log:', err.message);
  }
};

module.exports = { logAction };
