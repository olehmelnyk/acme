const path = require('path');

const buildEslintCommand = (filenames) =>
  `nx affected:lint --files=${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(',')}}`;

module.exports = {
  '*.{js,jsx,ts,tsx}': [
    buildEslintCommand,
    () => 'nx affected:test --parallel=3',
    () => 'nx affected:build',
  ],
  '*.{json,md,mdx,css,html,yml,yaml,scss}': ['prettier --write'],
  '**/*.ts?(x)': () => 'nx affected --target=typecheck',
};
