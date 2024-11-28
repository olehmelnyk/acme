const js = require('@eslint/js');
const nx = require('@nx/eslint-plugin');
const nextPlugin = require('@next/eslint-plugin-next');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...nx.configs['flat/react-typescript'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/next/app'],
      '@next/next/no-img-element': 'error',
      '@next/next/no-sync-scripts': 'error'
    }
  },
  {
    ignores: [
      '.next/**/*',
      'out/**/*',
      'dist/**/*',
      'node_modules/**/*',
      '.next/types/**/*'
    ]
  }
];
