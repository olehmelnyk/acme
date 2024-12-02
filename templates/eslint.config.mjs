import baseConfig from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*'],
    rules: {
      // Enable essential TypeScript rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      
      // Disable specific rules only if needed
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-function': 'off'
    }
  }
];
