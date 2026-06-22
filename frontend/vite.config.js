import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Local dev proxy: /api → backend on port 8080
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Kiro preview proxy: /_/backend → backend on port 8080
      '/_/backend': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_\/backend/, ''),
      },
    },
  },
});
