import nx from '@nx/eslint-plugin';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/coverage/**',
      '**/out/**',
      '**/static/**',
      '**/*.min.js',
      '**/*-[0-9a-f]*.js',
      '**/polyfills-*.js',
      '**/framework-*.js',
      '**/chunks/**',
      '**/webpack-*.js',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    plugins: {
      '@typescript-eslint': typescript,
      '@next/next': nextPlugin,
      '@nx': nx,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./tsconfig.base.json', './apps/*/tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        '__REACT_DEVTOOLS_GLOBAL_HOOK__': 'writable',
        '_N_E': 'writable',
        'ActiveXObject': 'readonly',
        'React': 'readonly',
      },
    },
    settings: {
      next: {
        rootDir: 'apps/next',
      },
      jsx: true,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',

      // Next.js specific rules
      '@next/next/no-html-link-for-pages': ['error', 'apps/next/app'],
      '@next/next/no-img-element': 'error',
      '@next/next/no-sync-scripts': 'error',

      // Nx rules
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],

      // Disabled rules for build artifacts
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-empty': 'off',
      'no-prototype-builtins': 'off',
      'no-unreachable': 'off',
      'no-func-assign': 'off',
      'no-cond-assign': 'off',
      'no-case-declarations': 'off',
      'getter-return': 'off',
      'no-misleading-character-class': 'off',
      'no-control-regex': 'off',
      'valid-typeof': 'off',
      'no-fallthrough': 'off',
      'no-undef': 'off',
      'no-self-assign': 'off',
      'no-global-assign': 'off',
      'no-redeclare': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    settings: {
      jsx: true,
    },
  },
];
