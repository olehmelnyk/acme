const baseConfig = require('../../eslint.config.js');
const playwright = require('eslint-plugin-playwright');

/** @type {import('@eslint/eslintrc').FlatConfig[]} */
module.exports = [
  ...baseConfig,
  {
    files: ['e2e/**/*.{ts,tsx}'],
    plugins: {
      playwright: playwright
    },
    rules: {
      'playwright/no-skipped-test': 'error',
      'playwright/no-focused-test': 'error'
    }
  }
];
