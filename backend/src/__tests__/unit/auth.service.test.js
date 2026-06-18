// Mock Prisma and bcrypt utilities so no DB or real hashing is needed
jest.mock('../../config/db', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../utils/hashPassword', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../../utils/jwt', () => ({
  generateToken: jest.fn(),
}));

const prisma = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/hashPassword');
const { generateToken } = require('../../utils/jwt');
const { registerUser, loginUser } = require('../../services/auth.service');
const AppError = require('../../utils/AppError');

// Seed the JWT_SECRET for tests
beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

describe('auth.service — registerUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should throw AppError(400) if user already exists', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@a.com' });

    await expect(
      registerUser({ fullName: 'Alice', email: 'a@a.com', password: 'pass' })
    ).rejects.toThrow(new AppError('User already exists with this email address.', 400));
  });

  it('should create a new user and return user + token', async () => {
    prisma.user.findUnique.mockResolvedValue(null); // no existing user
    hashPassword.mockResolvedValue('hashed-password');
    const mockUser = { id: 1, fullName: 'Alice', email: 'a@a.com', role: 'USER', createdAt: new Date() };
    prisma.user.create.mockResolvedValue(mockUser);
    generateToken.mockReturnValue('mock-jwt-token');

    const result = await registerUser({ fullName: 'Alice', email: 'a@a.com', password: 'secret' });

    expect(hashPassword).toHaveBeenCalledWith('secret');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fullName: 'Alice',
          email: 'a@a.com',
          password: 'hashed-password',
        }),
      })
    );
    expect(generateToken).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual({ user: mockUser, token: 'mock-jwt-token' });
  });
});

describe('auth.service — loginUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should throw AppError(401) when user is not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      loginUser({ email: 'nobody@a.com', password: 'pass' })
    ).rejects.toThrow(new AppError('Invalid credentials.', 401));
  });

  it('should throw AppError(401) when password does not match', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@a.com', password: 'hashed' });
    comparePassword.mockResolvedValue(false);

    await expect(
      loginUser({ email: 'a@a.com', password: 'wrong' })
    ).rejects.toThrow(new AppError('Invalid credentials.', 401));
  });

  it('should return user data and token on successful login', async () => {
    const mockUser = { id: 2, fullName: 'Bob', email: 'b@b.com', role: 'USER', password: 'hashed' };
    prisma.user.findUnique.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(true);
    generateToken.mockReturnValue('valid-jwt');

    const result = await loginUser({ email: 'b@b.com', password: 'correctPass' });

    expect(result.token).toBe('valid-jwt');
    expect(result.user.email).toBe('b@b.com');
    expect(result.user).not.toHaveProperty('password'); // password must be stripped
  });
});
