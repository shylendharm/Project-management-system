import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    // Use jsdom to simulate a browser environment
    environment: 'jsdom',
    // Run our setup file before each test suite
    setupFiles: './src/tests/setup.js',
    // Include .jsx and .js test files
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    globals: true,
  },
});

