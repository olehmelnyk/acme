import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { DocsFetcherError } from './errors';
import { ErrorCode } from './errors';
import { logger } from './logger';

export class DirectoryManager {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async init(): Promise<void> {
    try {
      if (!fs.existsSync(this.baseDir)) {
        await fs.promises.mkdir(this.baseDir, { recursive: true });
      }
    } catch (err) {
      throw new DocsFetcherError(
        ErrorCode.INIT_ERROR,
        `Failed to initialize directory manager: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  async getPackageDir(packageName: string): Promise<string> {
    const packageDir = path.join(this.baseDir, this.sanitizePackageName(packageName));
    return packageDir;
  }

  async ensurePackageDir(packageName: string): Promise<string> {
    const packageDir = await this.getPackageDir(packageName);
    
    try {
      await fs.promises.mkdir(packageDir, { recursive: true });
      return packageDir;
    } catch (err) {
      throw new DocsFetcherError(
        ErrorCode.DIRECTORY_ERROR,
        `Failed to create package directory: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  async clearPackageDir(packageName: string): Promise<void> {
    logger.info(`Clearing existing documentation for ${packageName}...`);
    const packageDir = await this.getPackageDir(packageName);
    
    if (fs.existsSync(packageDir)) {
      try {
        await fs.promises.rm(packageDir, { recursive: true });
      } catch (err) {
        throw new DocsFetcherError(
          ErrorCode.DIRECTORY_ERROR,
          `Failed to clear package directory: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    }
  }

  async findPackages(patterns: string[]): Promise<string[]> {
    const packages: string[] = [];

    for (const pattern of patterns) {
      const searchPath = path.join(process.cwd(), pattern);
      
      try {
        const files = await glob(searchPath, { absolute: true });
        
        for (const file of files) {
          const packageJsonPath = path.resolve(file);
          const packageDir = path.dirname(packageJsonPath);
          const packageName = path.basename(packageDir);
          
          packages.push(packageName);
        }
      } catch (err) {
        logger.warn(`Could not find packages matching pattern ${pattern}: ${err}`);
      }
    }

    return packages;
  }

  async writeFile(packageName: string, filename: string, content: string): Promise<void> {
    const packageDir = await this.ensurePackageDir(packageName);
    const filePath = path.join(packageDir, filename);
    
    try {
      await fs.promises.writeFile(filePath, content, 'utf-8');
    } catch (err) {
      throw new DocsFetcherError(
        ErrorCode.FILE_WRITE_ERROR,
        `Failed to write file: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  async readFile(packageName: string, filename: string): Promise<string> {
    const packageDir = await this.getPackageDir(packageName);
    const filePath = path.join(packageDir, filename);
    
    try {
      return await fs.promises.readFile(filePath, 'utf-8');
    } catch (err) {
      throw new DocsFetcherError(
        ErrorCode.FILE_READ_ERROR,
        `Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  async listFiles(packageName: string): Promise<string[]> {
    const packageDir = await this.getPackageDir(packageName);
    
    try {
      if (!fs.existsSync(packageDir)) {
        return [];
      }
      return await fs.promises.readdir(packageDir);
    } catch (err) {
      throw new DocsFetcherError(
        ErrorCode.DIRECTORY_ERROR,
        `Failed to list files: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  private sanitizePackageName(name: string): string {
    // Replace any characters that might be problematic in filenames
    return name.replace(/[^a-zA-Z0-9-_.]/g, '_');
  }
}
