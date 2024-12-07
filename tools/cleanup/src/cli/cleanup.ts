#!/usr/bin/env bun
import { Command } from 'commander';
import { CleanupManager } from '../cleanup-manager';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../../../../');

const program = new Command();

program
  .name('cleanup')
  .description('Clean up project artifacts and temporary files')
  .option('-a, --artifacts', 'Clean build artifacts and test outputs')
  .option('-b, --backups', 'Clean backup files')
  .option('-s, --old-scripts', 'Clean old script directories')
  .option('-d, --dependencies', 'Clean node_modules and lock files')
  .option('--all', 'Clean everything')
  .option('--dry-run', 'Show what would be deleted without actually deleting')
  .option('-f, --force', 'Skip confirmation prompt')
  .parse(process.argv);

const options = program.opts();

const cleanupManager = new CleanupManager(rootDir);

cleanupManager.run({
  artifacts: options['artifacts'] || options['all'],
  backups: options['backups'] || options['all'],
  oldScripts: options['old-scripts'] || options['all'],
  dependencies: options['dependencies'] || options['all'],
  dryRun: options['dry-run'],
  force: options['force']
});
