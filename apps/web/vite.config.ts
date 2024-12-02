/// <reference types="vitest" />
import { mergeConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

const config = {
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  build: {
    outDir: '../../dist/apps/web',
    reportCompressedSize: true,
    commonjsOptions: { 
      transformMixedEsModules: true,
      requireReturnsDefault: 'auto'
    },
    target: 'esnext',
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        format: 'es',
      },
    },
  },
  server: {
    port: 4200,
    host: 'localhost',
    deps: {
      inline: [/\.css$/]
    }
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths()],
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  },
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest'
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: [resolve(__dirname, './vitest.setup.ts')],
    reporters: ['default', 'html'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/*.d.ts',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        '.storybook/**',
        'stories/**',
        'public/**',
        'html/**',
        '.next/**',
        '**/*.config.{js,ts,mjs}',
        '**/vitest.setup.ts',
        '**/__mocks__/**',
        '**/static/chunks/**',
        '**/_buildManifest.js',
        '**/_ssgManifest.js',
        '**/not-found/**',
        '**/app/api/hello/**',
        '**/chunks/pages/**'
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    },
    deps: {
      optimizer: {
        web: {
          include: [/\.css$/]
        }
      }
    }
  }
};

export default mergeConfig(config, {});
