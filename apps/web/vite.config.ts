/// <reference types="vitest" />
import { mergeConfig, defineConfig as defineViteConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

const viteConfig = defineViteConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  plugins: [react(), nxViteTsPaths()],
});

export default mergeConfig(
  viteConfig,
  defineVitestConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      setupFiles: ['../../vitest.setup.mts'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../coverage/apps/web',
        provider: 'v8'
      }
    }
  })
);
