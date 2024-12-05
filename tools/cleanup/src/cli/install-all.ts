#!/usr/bin/env bun
import { sync as globSync } from 'glob';
import { dirname } from 'path';
import { spawnSync } from 'child_process';
import chalk from 'chalk';

// Find all package.json files
const packageJsons = globSync('**/package.json', {
  ignore: ['**/node_modules/**'],
  absolute: true
});

console.log(chalk.blue('Installing dependencies in all directories with package.json...'));

// Sort package.jsons to ensure root is first
packageJsons.sort((a, b) => a.split('/').length - b.split('/').length);

for (const packageJson of packageJsons) {
  const dir = dirname(packageJson);
  console.log(chalk.yellow(`\nInstalling in ${dir}`));
  
  const result = spawnSync('bun', ['install'], {
    cwd: dir,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    console.error(chalk.red(`Failed to install dependencies in ${dir}`));
    process.exit(1);
  }
}

console.log(chalk.green('\nAll dependencies installed successfully!'));
