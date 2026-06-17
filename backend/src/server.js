const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory before importing app
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
