const path = require('path');
const os = require('os');

const buildEslintCommand = (filenames) =>
  `nx affected:lint --files=${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(',')}}`;

const getParallelCount = () => Math.max(1, os.cpus().length - 1);

module.exports = {
  '*.{js,jsx,ts,tsx}': [
    buildEslintCommand,
    () => `nx affected:test --parallel=${getParallelCount()}`,
    () => 'nx affected:build',
  ],
  '*.{json,md,mdx,css,html,yml,yaml,scss}': ['prettier --write'],
  '**/*.ts?(x)': () => 'nx affected --target=typecheck',
};
