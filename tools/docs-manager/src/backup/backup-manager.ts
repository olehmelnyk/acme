import { mkdir, copyFile, readdir, readFile, writeFile, rm, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { ConfigurationManager } from '../utils/config-manager';

interface BackupMetadata {
  timestamp: number;
  files: string[];
  size: number;
  version: string;
}

export class BackupManager {
  private readonly VERSION = '1.0.0';
  private backupDir!: string;
  private config: ConfigurationManager;

  constructor(private workingDir: string = process.cwd()) {
    this.config = ConfigurationManager.getInstance(workingDir);
    this.initialize().catch(error => {
      console.error('Failed to initialize backup manager:', error);
    });
  }

  private async initialize(): Promise<void> {
    const backupDir = await this.config.getBackupDir();
    this.backupDir = join(this.workingDir, backupDir);
    await this.ensureBackupDir();
  }

  private async ensureBackupDir(): Promise<void> {
    try {
      await mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to ensure backup directory:', errorMessage);
    }
  }

  /**
   * Create a new backup of the current diagrams
   */
  async createBackup(): Promise<string> {
    if (!this.backupDir) {
      await this.initialize();
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(this.backupDir, `backup-${timestamp}`);

    try {
      await mkdir(backupPath, { recursive: true });
      
      const diagramsRoot = await this.config.getDiagramsRoot();
      const absoluteDiagramsRoot = join(this.workingDir, diagramsRoot);
      
      const files = await this.findDiagramFiles(absoluteDiagramsRoot);
      if (files.length === 0) {
        throw new Error('No diagram files found to backup');
      }

      let totalSize = 0;
      const metadata: BackupMetadata = {
        timestamp: Date.now(),
        files: [],
        size: 0,
        version: this.VERSION
      };

      for (const file of files) {
        try {
          const relativePath = file.replace(absoluteDiagramsRoot + '/', '');
          const targetPath = join(backupPath, relativePath);
          
          await mkdir(dirname(targetPath), { recursive: true });
          await copyFile(file, targetPath);
          
          const stats = await stat(file);
          totalSize += stats.size;
          metadata.files.push(relativePath);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Failed to backup file ${file}:`, errorMessage);
        }
      }

      metadata.size = totalSize;
      await this.writeBackupMetadata(backupPath, metadata);
      
      return backupPath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (backupPath) {
        await rm(backupPath, { recursive: true, force: true });
      }
      throw new Error(`Failed to create backup: ${errorMessage}`);
    }
  }

  /**
   * Clean up old backups based on maxBackupAge configuration
   */
  async cleanupOldBackups(): Promise<void> {
    try {
      const maxAge = await this.config.getMaxBackupAge();
      const maxAgeMs = this.parseMaxAge(maxAge);
      const now = Date.now();

      const backups = await readdir(this.backupDir);
      for (const backup of backups) {
        const backupPath = join(this.backupDir, backup);
        try {
          const metadata = await this.readBackupMetadata(backupPath);
          if (now - metadata.timestamp > maxAgeMs) {
            await rm(backupPath, { recursive: true, force: true });
          }
        } catch (error) {
          // If metadata is invalid, throw the error
          throw new Error(`Failed to process backup ${backup}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } catch (error) {
      throw new Error(`Failed to cleanup old backups: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async writeBackupMetadata(backupPath: string, metadata: BackupMetadata): Promise<void> {
    const metadataPath = join(backupPath, 'backup-metadata.json');
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async readBackupMetadata(backupPath: string): Promise<BackupMetadata> {
    const metadataPath = join(backupPath, 'backup-metadata.json');
    const content = await readFile(metadataPath, 'utf8');
    return JSON.parse(content) as BackupMetadata;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private parseMaxAge(maxAge: string): number {
    const value = parseInt(maxAge);
    const unit = maxAge.slice(-1);

    switch (unit.toLowerCase()) {
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'm':
        return value * 60 * 1000;
      default:
        throw new Error(`Invalid max age unit: ${unit}`);
    }
  }

  private async findDiagramFiles(root: string): Promise<string[]> {
    try {
      const files = await readdir(root, { withFileTypes: true });
      const diagrams: string[] = [];

      for (const file of files) {
        const fullPath = join(root, file.name);
        if (file.isDirectory()) {
          const subDiagrams = await this.findDiagramFiles(fullPath);
          diagrams.push(...subDiagrams);
        } else if (file.isFile() && file.name.endsWith('.md')) {
          diagrams.push(fullPath);
        }
      }

      return diagrams;
    } catch (error) {
      // If directory doesn't exist, treat it as no files found
      if (error instanceof Error && error.message.includes('ENOENT')) {
        return [];
      }
      throw error;
    }
  }

  // Add a public method to check initialization status
  public async isInitialized(): Promise<boolean> {
    return !!this.backupDir;
  }

  // Optional: Add a public method to force initialization for testing
  public async forceInitialize(): Promise<void> {
    await this.initialize();
  }
}
