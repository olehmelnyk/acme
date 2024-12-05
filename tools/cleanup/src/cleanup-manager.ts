import { rm } from 'fs/promises';
import { join } from 'path';
import { sync as globSync } from 'glob';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { createInterface } from 'readline';

export interface CleanupOptions {
  artifacts?: boolean;
  backups?: boolean;
  oldScripts?: boolean;
  dependencies?: boolean;
  dryRun?: boolean;
  force?: boolean;
}

export class CleanupManager {
  private filesToDelete: Set<string> = new Set();
  
  constructor(private rootDir: string) {}

  private async remove(path: string, dryRun: boolean, isNodeModule = false): Promise<void> {
    if (!existsSync(path)) {
      return; // Skip if path doesn't exist
    }

    if (dryRun) {
      if (isNodeModule) {
        // For node_modules, only show the parent directory path
        const parentDir = path.split('node_modules')[0] + 'node_modules';
        if (existsSync(parentDir)) {
          this.filesToDelete.add(parentDir);
          console.log(chalk.yellow(`Would remove ${parentDir}`));
        }
      } else {
        this.filesToDelete.add(path);
        console.log(chalk.yellow(`Would remove ${path}`));
      }
      return;
    }
    await rm(path, { recursive: true, force: true });
    console.log(chalk.green(`Cleaned up ${path}`));
  }

  private async confirmCleanup(): Promise<boolean> {
    if (this.filesToDelete.size === 0) {
      console.log(chalk.blue('No files to clean up.'));
      return false;
    }

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(chalk.yellow('\nDo you want to proceed with deletion? (y/N) '), (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }

  async cleanupDependencies(dryRun: boolean): Promise<void> {
    // First handle node_modules
    try {
      const nodeModules = globSync('**/node_modules', {
        cwd: this.rootDir,
        absolute: true
      });

      // Create a Set to store unique parent paths
      const uniquePaths = new Set<string>();
      
      for (const match of nodeModules) {
        // Get the parent path that contains node_modules
        const parentPath = match.split('/node_modules')[0] + '/node_modules';
        if (existsSync(parentPath)) {
          uniquePaths.add(parentPath);
        }
      }

      // Now process unique paths
      for (const path of uniquePaths) {
        try {
          await this.remove(path, dryRun, true);
        } catch (error) {
          console.error(chalk.red(`Failed to remove ${path}:`, error));
        }
      }
    } catch (error) {
      console.error(chalk.red(`Failed to clean up node_modules:`, error));
    }

    // Then handle lock files
    const lockPatterns = [
      '**/bun.lockb',
      '**/*.bun'
    ];

    for (const pattern of lockPatterns) {
      try {
        const matches = globSync(pattern, {
          cwd: this.rootDir,
          absolute: true
        });

        for (const match of matches) {
          try {
            if (existsSync(match)) {
              await this.remove(match, dryRun);
            }
          } catch (error) {
            console.error(chalk.red(`Failed to remove ${match}:`, error));
          }
        }
      } catch (error) {
        console.error(chalk.red(`Failed to clean up ${pattern}:`, error));
      }
    }
  }

  async cleanupBackups(dryRun: boolean): Promise<void> {
    try {
      const backupDir = join(this.rootDir, '.diagrams-backup');
      if (existsSync(backupDir)) {
        await this.remove(backupDir, dryRun);
        if (!dryRun) {
          console.log(chalk.green('Successfully cleaned up diagram backups'));
        }
      }
    } catch (error) {
      console.error(chalk.red('Failed to clean up diagram backups:', error));
    }
  }

  async cleanupArtifacts(dryRun: boolean): Promise<void> {
    const patterns = [
      // Test outputs
      '**/playwright-report/**',
      '**/test-results/**',
      '**/coverage/**',
      '**/html/**',
      // Build outputs
      '**/output/**',  // Legacy output directory
      '**/artifacts/**', // New standardized output directory
      '**/.next/**',
      '**/storybook-static/**',
      // Temporary files
      '**/.nx/cache/**',
      '**/tmp/**',
      // Logs
      '**/logs/**',
      '**/*.log'
    ];

    for (const pattern of patterns) {
      try {
        const matches = globSync(pattern, {
          cwd: this.rootDir,
          absolute: true,
          ignore: ['**/node_modules/**']
        });

        for (const match of matches) {
          try {
            if (existsSync(match)) {
              await this.remove(match, dryRun);
            }
          } catch (error) {
            console.error(chalk.red(`Failed to remove ${match}:`, error));
          }
        }
      } catch (error) {
        console.error(chalk.red(`Failed to clean up ${pattern}:`, error));
      }
    }
  }

  async cleanupOldScripts(dryRun: boolean): Promise<void> {
    const oldPaths = [
      join(this.rootDir, 'scripts', 'docs'),
      join(this.rootDir, 'tests', 'docs')
    ];

    for (const path of oldPaths) {
      try {
        if (existsSync(path)) {
          await this.remove(path, dryRun);
        }
      } catch (error) {
        console.error(chalk.red(`Failed to clean up ${path}:`, error));
      }
    }
  }

  async run(options: CleanupOptions = {}): Promise<void> {
    const {
      artifacts = false,
      backups = false,
      oldScripts = false,
      dependencies = false,
      dryRun = false,
      force = false
    } = options;
    
    const runAll = !artifacts && !backups && !oldScripts && !dependencies;
    const mode = dryRun ? chalk.yellow('[DRY RUN]') : '';

    // Clear the files to delete set before starting
    this.filesToDelete.clear();

    console.log(chalk.blue(`Starting cleanup... ${mode}`));
    
    // Skip dry run and confirmation if force flag is used
    if (!dryRun && !force) {
      // First do a dry run to collect all files that would be deleted
      if (runAll || artifacts) {
        await this.cleanupArtifacts(true);
      }
      
      if (runAll || backups) {
        await this.cleanupBackups(true);
      }
      
      if (runAll || oldScripts) {
        await this.cleanupOldScripts(true);
      }

      if (runAll || dependencies) {
        await this.cleanupDependencies(true);
      }

      // Ask for confirmation
      if (!(await this.confirmCleanup())) {
        console.log(chalk.blue('Cleanup cancelled.'));
        return;
      }
    }

    // Now do the actual cleanup if not in dry-run mode
    this.filesToDelete.clear(); // Clear the set for actual deletion messages
    
    if (runAll || artifacts) {
      await this.cleanupArtifacts(dryRun);
    }
    
    if (runAll || backups) {
      await this.cleanupBackups(dryRun);
    }
    
    if (runAll || oldScripts) {
      await this.cleanupOldScripts(dryRun);
    }

    if (runAll || dependencies) {
      await this.cleanupDependencies(dryRun);
    }
    
    console.log(chalk.blue(`Cleanup completed ${mode}`));
  }
}
