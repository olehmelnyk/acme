import nx from '@nx/eslint-plugin';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const project = [
  resolve(__dirname, './tsconfig.base.json'),
  resolve(__dirname, './apps/*/tsconfig.json'),
  resolve(__dirname, './apps/*/.storybook/tsconfig.json'),
  resolve(__dirname, './tools/*/tsconfig.json')
];

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/coverage/**',
      '**/.cache/**',
      '**/.eslintcache',
      '**/generated/**',
      '**/templates/**',
      '**/.env*'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescript,
      '@nx': nx
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project,
        tsconfigRootDir: __dirname
      }
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      },
      'import/resolver': {
        typescript: {
          project
        }
      }
    },
    rules: {
      ...typescript.configs['recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-var-requires': 'off',
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allowCircularSelfDependency: true,
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*']
            }
          ]
        }
      ]
    }
  }
];
