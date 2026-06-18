// We mock the Prisma client BEFORE requiring the service so the
// service picks up the mock instead of a real database connection.
jest.mock('../../config/db', () => ({
  auditLog: {
    create: jest.fn(),
  },
}));

const prisma = require('../../config/db');
const { logAction } = require('../../services/auditLog.service');

describe('auditLog.service — logAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should call prisma.auditLog.create with the correct data', async () => {
    prisma.auditLog.create.mockResolvedValue({});

    await logAction(1, 'PROJECT_CREATED', 'Test project created');

    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: { userId: 1, action: 'PROJECT_CREATED', details: 'Test project created' },
    });
  });

  it('should default details to null when not provided', async () => {
    prisma.auditLog.create.mockResolvedValue({});

    await logAction(5, 'USER_LOGGED_IN');

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: { userId: 5, action: 'USER_LOGGED_IN', details: null },
    });
  });

  it('should NOT throw even if prisma.auditLog.create rejects (non-fatal)', async () => {
    prisma.auditLog.create.mockRejectedValue(new Error('DB connection refused'));

    // logAction must swallow errors silently
    await expect(logAction(1, 'SOME_ACTION')).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      '[AuditLog] Failed to write log:',
      'DB connection refused'
    );
  });
});
