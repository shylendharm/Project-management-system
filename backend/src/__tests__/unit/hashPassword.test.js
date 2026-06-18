const { hashPassword, comparePassword } = require('../../utils/hashPassword');

describe('hashPassword utility', () => {
  const plainText = 'MySecurePassword123!';

  it('should hash a password and return a non-empty string', async () => {
    const hash = await hashPassword(plainText);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should produce a different hash each time (due to unique salt)', async () => {
    const hash1 = await hashPassword(plainText);
    const hash2 = await hashPassword(plainText);
    expect(hash1).not.toBe(hash2);
  });

  it('should not equal the original plain-text password', async () => {
    const hash = await hashPassword(plainText);
    expect(hash).not.toBe(plainText);
  });
});

describe('comparePassword utility', () => {
  const plainText = 'MySecurePassword123!';
  let hash;

  beforeAll(async () => {
    hash = await hashPassword(plainText);
  });

  it('should return true when comparing the correct password', async () => {
    const result = await comparePassword(plainText, hash);
    expect(result).toBe(true);
  });

  it('should return false when comparing a wrong password', async () => {
    const result = await comparePassword('WrongPassword!', hash);
    expect(result).toBe(false);
  });
});
