import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        // IMPORTANT: No 'rewrite' rule here, as backend expects '/api' prefix
      },
      '/ws': { // <--- ADD THIS NEW PROXY ENTRY FOR WEBSOCKETS
        target: 'ws://127.0.0.1:3001', // Backend WebSocket server
        ws: true, // <--- IMPORTANT: Enable WebSocket proxying
        rewriteWsOrigin: true,
      },
    },
  },
});