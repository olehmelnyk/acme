import baseConfig from '../../eslint.config.mjs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'],
    parserOptions: {
      project: [resolve(__dirname, './tsconfig.json')]
    },
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/web/src/pages'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  },
  {
    files: ['.storybook/**/*.ts', '.storybook/**/*.tsx', '.storybook/**/*.js', '.storybook/**/*.jsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
];
