#!/usr/bin/env bun
import { Command } from 'commander';
import { CleanupManager } from '../scripts/cleanup-manager';

interface CleanupOptions {
  [key: string]: any;
  all: boolean;
  backups: boolean;
  tests: boolean;
  scripts: boolean;
}

const program = new Command();

program
  .name('docs-cleanup')
  .description('Clean up documentation-related artifacts')
  .option('--backups', 'Clean up diagram backups')
  .option('--tests', 'Clean up test artifacts')
  .option('--scripts', 'Clean up old scripts')
  .option('--all', 'Clean up everything');

program.parse();

const options: CleanupOptions = program.opts();
const cleanup = new CleanupManager();

(async () => {
  if (options['all'] || options['backups']) {
    await cleanup.cleanupBackups();
  }
  
  if (options['all'] || options['tests']) {
    await cleanup.cleanupTestArtifacts();
  }
  
  if (options['all'] || options['scripts']) {
    await cleanup.cleanupOldScripts();
  }
})();
