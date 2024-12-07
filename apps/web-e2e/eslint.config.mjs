import baseConfig from '../../eslint.config.mjs';
import playwright from 'eslint-plugin-playwright';

/** @type {import('@eslint/eslintrc').FlatConfig[]} */
export default [
  ...baseConfig,
  {
    files: ['e2e/**/*.{ts,tsx}'],
    plugins: {
      playwright
    },
    rules: {
      'playwright/no-skipped-test': 'error',
      'playwright/no-focused-test': 'error'
    }
  }
];
