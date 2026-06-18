/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',

  // Look for tests in a dedicated __tests__ directory
  testMatch: ['**/__tests__/**/*.test.js'],

  // Load environment variables from .env.test before any test runs
  globalSetup: './src/__tests__/globalSetup.js',

  // Print individual test names in output
  verbose: true,
};
