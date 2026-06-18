/**
 * Integration tests for /api/auth routes.
 *
 * Strategy: We mock the Prisma client so no real database is needed.
 * Supertest fires real HTTP requests against the Express app so we
 * test the full middleware chain (validation → controller → service → response).
 */

// ── Mock Prisma BEFORE app is required ──────────────────────────────────────
jest.mock('../../config/db', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

// ── Mock rate limiter so tests never get 429'd ───────────────────────────────
jest.mock('../../middlewares/rateLimiter', () => ({
  globalLimiter: (_req, _res, next) => next(),
  authLimiter: (_req, _res, next) => next(),
}));

const request = require('supertest');
const app = require('../../app');
const prisma = require('../../config/db');

// Seed env vars needed by JWT utils
beforeAll(() => {
  process.env.JWT_SECRET = 'integration-test-secret';
  process.env.JWT_EXPIRES_IN = '1d';
});

beforeEach(() => jest.clearAllMocks());

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('should return 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' }); // missing fullName and password

    expect(res.statusCode).toBe(400);
  });

  it('should return 400 when user already exists', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'existing@test.com' });

    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Alice',
      email: 'existing@test.com',
      password: 'ValidPass123!',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should return 201 with token when registration succeeds', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      fullName: 'Alice',
      email: 'alice@test.com',
      role: 'USER',
      createdAt: new Date(),
    });

    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Alice',
      email: 'alice@test.com',
      password: 'ValidPass123!',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('alice@test.com');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('should return 400 when email or password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com' }); // missing password

    expect(res.statusCode).toBe(400);
  });

  it('should return 401 when credentials are invalid', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com',
      password: 'SomePass123!',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});
