/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/web',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../artifacts/apps/web/coverage',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
      provider: 'v8',
    },
    deps: {
      inline: [
        '@testing-library/user-event',
        '@testing-library/react',
        '@testing-library/jest-dom',
        'next/navigation',
        'next/font/google'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './components'),
      '@lib': resolve(__dirname, './lib'),
      '@styles': resolve(__dirname, './styles'),
    },
  }
});
