/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
    include: ['./src/**/*.spec.tsx'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/mobile',
      provider: 'v8'
    },
    mockReset: true,
    server: {
      deps: {
        inline: [
          'react-native',
          '@testing-library/react-native',
          '@testing-library/jest-native'
        ]
      }
    }
  }
});
