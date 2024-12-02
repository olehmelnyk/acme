import baseConfig from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*'],
    rules: {
      '@typescript-eslint/*': 'off'
    }
  }
];
