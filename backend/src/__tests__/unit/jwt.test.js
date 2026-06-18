const { generateToken, verifyToken } = require('../../utils/jwt');
const AppError = require('../../utils/AppError');

// NOTE: JWT_SECRET is loaded by globalSetup.js from .env.test before tests run.

describe('JWT utilities', () => {
  const userId = 42;

  describe('generateToken', () => {
    it('should return a non-empty JWT string', () => {
      const token = generateToken(userId);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // header.payload.signature
    });

    it('should throw AppError if JWT_SECRET is not set', () => {
      const original = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      expect(() => generateToken(userId)).toThrow(AppError);
      process.env.JWT_SECRET = original; // restore
    });
  });

  describe('verifyToken', () => {
    it('should decode the token and return the correct user id', () => {
      const token = generateToken(userId);
      const payload = verifyToken(token);
      expect(payload.id).toBe(userId);
    });

    it('should throw when given an invalid token', () => {
      expect(() => verifyToken('this.is.invalid')).toThrow();
    });

    it('should throw AppError if JWT_SECRET is not set during verify', () => {
      const token = generateToken(userId);
      const original = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      expect(() => verifyToken(token)).toThrow(AppError);
      process.env.JWT_SECRET = original; // restore
    });
  });
});
