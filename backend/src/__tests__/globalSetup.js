const path = require('path');
const dotenv = require('dotenv');

/**
 * globalSetup runs ONCE before any test suite.
 * We load .env.test here so all environment variables
 * are available even before the test files are imported.
 */
module.exports = async () => {
  dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.test') });
};
