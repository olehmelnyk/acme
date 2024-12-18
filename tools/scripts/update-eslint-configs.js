const fs = require('fs');
const path = require('path');

const projectDirs = [
  'apps/mobile',
  'apps/web',
  'apps/web-e2e',
  'tools/cleanup',
  'tools/docs-fetcher',
  'tools/package-analyzer'
];

const esmEslintConfig = `import { join } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import baseConfig from '../../eslint.config.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: baseConfig
});

export default [...baseConfig];
`;

const cjsEslintConfig = `const { join } = require('path');
const { FlatCompat } = require('@eslint/eslintrc');
const baseConfig = require('../../eslint.config.js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: baseConfig
});

module.exports = [...baseConfig];
`;

projectDirs.forEach(dir => {
  const configPath = path.join(__dirname, '../../', dir, 'eslint.config.js');
  const oldConfigPath = path.join(__dirname, '../../', dir, '.eslintrc.json');
  const packageJsonPath = path.join(__dirname, '../../', dir, 'package.json');
  
  // Remove old config if exists
  if (fs.existsSync(oldConfigPath)) {
    fs.unlinkSync(oldConfigPath);
  }
  
  // Check if package.json exists and has type: "module"
  let isESM = false;
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    isESM = packageJson.type === 'module';
  } catch (e) {
    // If package.json doesn't exist or can't be parsed, assume CommonJS
  }
  
  // Write new config based on module type
  fs.writeFileSync(configPath, isESM ? esmEslintConfig : cjsEslintConfig);
  console.log(`Updated ESLint config for ${dir} (${isESM ? 'ESM' : 'CJS'})`);
});
