import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    parserOptions: {
      project: ['apps/web-e2e/tsconfig.json']
    },
    rules: {
      // Allow 'any' only in test fixtures and utilities
      '@typescript-eslint/no-explicit-any': ['warn', {
        ignoreRestArgs: true,
        fixToUnknown: true
      }],
      
      // Ensure proper Promise handling
      '@typescript-eslint/await-thenable': ['error', {
        checkAllCodePaths: true
      }],
      
      // Allow floating promises only in test teardown
      '@typescript-eslint/no-floating-promises': ['error', {
        ignoreVoid: true,
        ignoreIIFE: true
      }],
      
      // Additional E2E-specific rules
      '@typescript-eslint/no-misused-promises': ['error', {
        checksVoidReturn: false
      }],
      '@typescript-eslint/unbound-method': ['error', {
        ignoreStatic: true
      }],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error'
    },
    env: {
      node: true,  // For Playwright node environment
      browser: true // For browser context
    },
    overrides: [
      {
        // More permissive rules for test fixtures
        files: ['**/fixtures/**/*', '**/utils/**/*', '**/setup/**/*'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'off',
          '@typescript-eslint/no-floating-promises': 'off'
        }
      }
    ]
  }
];
