import { rm } from 'fs/promises';
import { join, resolve } from 'path';
import { glob } from 'glob';
import { ConfigurationManager } from '../utils/config-manager';

export class CleanupManager {
  private config: ConfigurationManager;
  private rootDir: string;

  constructor(private workingDir: string = process.cwd()) {
    this.config = ConfigurationManager.getInstance(workingDir);
    // Resolve to monorepo root
    this.rootDir = resolve(workingDir, '../..');
  }

  async cleanupBackups(): Promise<void> {
    try {
      const backupDir = join(this.rootDir, '.diagrams-backup');
      await rm(backupDir, { recursive: true, force: true });
      console.log('Successfully cleaned up diagram backups');
    } catch (error) {
      console.error('Failed to clean up diagram backups:', error);
    }
  }

  async cleanupTestArtifacts(): Promise<void> {
    const testDirs = [
      'playwright-report',
      'test-results',
      'coverage',
      'html',
      'dist',
      '.next',
      'out'
    ];

    for (const dir of testDirs) {
      try {
        const matches = await glob(`**/${dir}`, {
          cwd: this.rootDir,
          absolute: true,
          ignore: ['**/node_modules/**']
        });

        for (const match of matches) {
          await rm(match, { recursive: true, force: true });
          console.log(`Cleaned up ${match}`);
        }
      } catch (error) {
        console.error(`Failed to clean up ${dir}:`, error);
      }
    }
  }

  async cleanupOldScripts(): Promise<void> {
    const oldScriptPaths = [
      join(this.rootDir, 'scripts', 'docs'),
      join(this.rootDir, 'tests', 'docs')
    ];

    for (const path of oldScriptPaths) {
      try {
        await rm(path, { recursive: true, force: true });
        console.log(`Cleaned up old scripts at ${path}`);
      } catch (error) {
        console.error(`Failed to clean up ${path}:`, error);
      }
    }
  }

  async run(): Promise<void> {
    console.log('Starting cleanup...');
    
    await this.cleanupBackups();
    await this.cleanupTestArtifacts();
    await this.cleanupOldScripts();
    
    console.log('Cleanup completed');
  }
}
