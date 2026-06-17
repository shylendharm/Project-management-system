const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

/**
 * Register a new user in the database.
 * @param {object} userData
 * @returns {Promise<object>} Created user and JWT token
 */
const registerUser = async ({ fullName, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('User already exists with this email address.', 400);
  }

  // Hash password using the utility (12 rounds can be set in bcrypt config/utility)
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
    },
  });

  const token = generateToken(user.id);

  return { user, token };
};

/**
 * Authenticate a user and return a JWT.
 * @param {object} credentials
 * @returns {Promise<object>} User details and JWT token
 */
const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid credentials.', 401);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials.', 401);
  }

  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};
