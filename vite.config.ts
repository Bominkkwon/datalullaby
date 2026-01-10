import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
    },
  },
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      // Externalize server-side dependencies
      external: [
        // Add any problematic modules here
        'rollup',
        '@rollup/*',
      ],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
