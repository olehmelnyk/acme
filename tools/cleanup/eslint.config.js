import { join } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import baseConfig from '../../eslint.config.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: baseConfig
});

export default [...baseConfig];
