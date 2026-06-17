import { defineConfig, env } from 'prisma/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
config({ path: resolve(__dirname, 'backend', '.env') });

export default defineConfig({
  schema: './backend/prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
