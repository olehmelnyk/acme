import { readFile, writeFile, stat, mkdir } from 'fs/promises';
import { glob, type GlobOptions } from 'glob';
import { promisify } from 'util';
import { dirname } from 'path';
import chalk from 'chalk';

const globPromise = promisify(glob) as (pattern: string, options?: GlobOptions) => Promise<string[]>;

interface FileStats {
  path: string;
  size: number;
  lastModified: Date;
}

interface FindOptions {
  since?: Date;
  pattern?: string;
  ignore?: string[];
  recursive?: boolean;
}

interface LogMessage {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
  timestamp: number;
}

export class DocUtils {
  private static logBuffer: LogMessage[] = [];

  static async readFile(path: string): Promise<string> {
    try {
      return await readFile(path, 'utf-8');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read file ${path}: ${errorMessage}`);
    }
  }

  static async writeFile(path: string, content: string): Promise<void> {
    try {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content, 'utf-8');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to write file ${path}: ${errorMessage}`);
    }
  }

  static async readJsonFile<T>(path: string): Promise<T> {
    try {
      const content = await this.readFile(path);
      return JSON.parse(content) as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read JSON file ${path}: ${errorMessage}`);
    }
  }

  static async writeJsonFile<T>(path: string, data: T): Promise<void> {
    try {
      const content = JSON.stringify(data, null, 2);
      await this.writeFile(path, content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to write JSON file ${path}: ${errorMessage}`);
    }
  }

  static async findFiles(directory: string, options: FindOptions = {}): Promise<FileStats[]> {
    const pattern = options.pattern || '**/*';
    const ignore = options.ignore || ['**/node_modules/**', '**/dist/**'];

    try {
      const files = await globPromise(pattern, {
        cwd: directory,
        ignore,
        absolute: true
      });

      const stats: FileStats[] = [];

      for (const file of files) {
        const fileStat = await stat(file);
        if (options.since && fileStat.mtime.getTime() < options.since.getTime()) {
          continue;
        }

        stats.push({
          path: file,
          size: fileStat.size,
          lastModified: fileStat.mtime
        });
      }

      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to find files in ${directory}: ${errorMessage}`);
    }
  }

  static async traverseDirectory<T>(
    dir: string,
    callback: (filePath: string) => Promise<T | null>,
    filter: (filePath: string) => boolean = () => true
  ): Promise<T[]> {
    const results: T[] = [];
    const fileStats = await this.findFiles(dir);
    
    for (const file of fileStats) {
      if (filter(file.path)) {
        const result = await callback(file.path);
        if (result !== null) {
          results.push(result);
        }
      }
    }

    return results;
  }

  static formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  static formatDate(date: Date): string {
    return date.toISOString();
  }

  static logInfo(message: string, details?: string): void {
    console.log(chalk.blue('ℹ'), chalk.blue(message));
    if (details) {
      console.log(chalk.gray(details));
    }

    this.logBuffer.push({
      type: 'info',
      message,
      details,
      timestamp: Date.now()
    });
  }

  static logWarning(message: string, details?: string): void {
    console.log(chalk.yellow('⚠'), chalk.yellow(message));
    if (details) {
      console.log(chalk.gray(details));
    }

    this.logBuffer.push({
      type: 'warning',
      message,
      details,
      timestamp: Date.now()
    });
  }

  static logError(message: string, error?: Error | string | unknown): void {
    console.error(chalk.red('✖'), chalk.red(message));
    if (error) {
      console.error(chalk.gray(error instanceof Error ? error.stack : String(error)));
    }

    this.logBuffer.push({
      type: 'error',
      message,
      details: error ? String(error) : undefined,
      timestamp: Date.now()
    });
  }

  static logSuccess(message: string, details?: string): void {
    console.log(chalk.green('✓'), chalk.green(message));
    if (details) {
      console.log(chalk.gray(details));
    }

    this.logBuffer.push({
      type: 'success',
      message,
      details,
      timestamp: Date.now()
    });
  }

  static getLogBuffer(): LogMessage[] {
    return [...this.logBuffer];
  }

  static clearLogBuffer(): void {
    this.logBuffer = [];
  }

  static getFilteredLogs(options: {
    type?: LogMessage['type'];
    since?: number;
    limit?: number;
  } = {}): LogMessage[] {
    let filtered = [...this.logBuffer];

    if (options.type) {
      filtered = filtered.filter(log => log.type === options.type);
    }

    if (options.since) {
      filtered = filtered.filter(log => log.timestamp >= options.since!);
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }
}
