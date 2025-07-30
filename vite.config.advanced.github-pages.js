import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/advanced',
    base: '/front_6th_chapter2-1/', // GitHub Pages용 - 레포지토리명 기반 경로
    cssCodeSplit: false, // CSS를 단일 파일로 번들링
    rollupOptions: {
      output: {
        manualChunks: undefined, // 모든 코드를 단일 청크로 번들링
      },
    },
  },
  publicDir: 'public',
  root: '.',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.js'
  },
}); 