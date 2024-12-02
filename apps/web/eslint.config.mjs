import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'],
    parserOptions: {
      project: ['apps/web/tsconfig.json']
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
