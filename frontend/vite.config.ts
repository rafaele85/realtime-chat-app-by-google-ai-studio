import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Frontend dev server port
    proxy: {
      '/api': { // When the frontend requests /api/...
        target: 'http://localhost:3001', // Proxy it to our backend server
        changeOrigin: true, // Changes the origin of the host header to the target URL
        // No rewrite needed, as backend expects /api prefix
      },
    },
  },
});