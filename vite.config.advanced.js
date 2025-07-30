import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/advanced',
    base: '/front_6th_chapter2-1/', // GitHub Pages base path
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.js'
  },
}); 