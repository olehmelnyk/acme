import { DocsFetcherError, ErrorCode } from './errors';
import {
  CacheEntry,
  CacheStats,
  DirectoryInfo
} from './types';
import { mkdir, readdir, stat, writeFile, unlink, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { logger } from './logger';

export class CacheManager {
  private readonly cacheDir: string;
  private readonly maxSize: number;
  private readonly ttl: number;
  private readonly cleanupInterval: number;
  private stats: CacheStats;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(cacheDir: string, maxSize: number, ttl: number, cleanupInterval = 3600000) {
    // Add parameter validation
    if (!cacheDir) {
      throw new DocsFetcherError(
        ErrorCode.CONFIG_LOAD_ERROR,
        'Cache directory must be provided'
      );
    }

    this.cacheDir = cacheDir;
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.cleanupInterval = cleanupInterval;
    this.stats = {
      size: 0,
      entries: 0,
      hits: 0,
      misses: 0,
      lastCleanup: Date.now()
    };
  }

  async init(): Promise<void> {
    try {
      await mkdir(this.cacheDir, { recursive: true });
      await this.initializeStats();
      this.startCleanupTimer();
    } catch (err) {
      logger.error('Failed to initialize cache:', err);
      throw new DocsFetcherError(
        ErrorCode.CACHE_INIT_ERROR,
        `Failed to initialize cache: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  private async initializeStats(): Promise<void> {
    try {
      const statsPath = join(this.cacheDir, '.stats');
      const exists = await this.fileExists(statsPath);

      if (exists) {
        const data = await readFile(statsPath, 'utf-8');
        this.stats = JSON.parse(data);
      } else {
        this.stats = {
          size: 0,
          entries: 0,
          hits: 0,
          misses: 0,
          lastCleanup: Date.now()
        };
      }

      // Verify stats by counting actual files
      const files = await readdir(this.cacheDir);
      let actualSize = 0;
      let actualEntries = 0;

      for (const file of files) {
        if (file === '.stats') continue;
        try {
          const filePath = join(this.cacheDir, file);
          const data = await readFile(filePath, 'utf-8');
          const entry = JSON.parse(data) as CacheEntry<unknown>;
          actualSize += entry.size;
          actualEntries++;
        } catch (error) {
          // Skip invalid files
          console.warn(`Failed to read cache file ${file}:`, error);
        }
      }

      // Update stats if they don't match
      if (actualSize !== this.stats.size || actualEntries !== this.stats.entries) {
        this.stats.size = actualSize;
        this.stats.entries = actualEntries;
        await this.saveStats();
      }
    } catch {
      throw new DocsFetcherError(
        ErrorCode.CACHE_INIT_ERROR,
        'Failed to initialize cache'
      );
    }
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cleanupTimer = setInterval(() => {
      this.cleanup().catch(error => {
        logger.error('Cache cleanup failed:', error);
      });
    }, this.cleanupInterval);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const filePath = this.getFilePath(key);
      const exists = await this.fileExists(filePath);
      
      if (!exists) {
        this.stats.misses++;
        await this.saveStats();
        return null;
      }

      const fileContent = await readFile(filePath, 'utf-8');
      const entry = JSON.parse(fileContent) as CacheEntry<T>;

      if (this.isExpired(entry.timestamp)) {
        await this.delete(key);
        this.stats.misses++;
        await this.saveStats();
        return null;
      }

      this.stats.hits++;
      await this.saveStats();
      return entry.data;
    } catch {
      this.stats.misses++;
      await this.saveStats();
      return null;
    }
  }

  async setNew<T>(key: string, data: T): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        size: this.calculateSize(data)
      };

      if (entry.size > this.maxSize) {
        throw new DocsFetcherError(
          ErrorCode.CACHE_SET_ERROR,
          `Entry size (${entry.size} bytes) exceeds maximum cache size (${this.maxSize} bytes)`
        );
      }

      // Clean up if cache is full
      if (this.stats.size + entry.size > this.maxSize) {
        await this.cleanup();
      }

      // Delete old entry if it exists
      await this.delete(key);

      await writeFile(filePath, JSON.stringify(entry), 'utf-8');
      this.stats.entries++;
      this.stats.size += entry.size;
      await this.saveStats();
    } catch {
      throw new DocsFetcherError(
        ErrorCode.CACHE_SET_ERROR,
        'Failed to set cache entry'
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      const exists = await this.fileExists(filePath);
      
      if (exists) {
        const fileContent = await readFile(filePath, 'utf-8');
        const entry = JSON.parse(fileContent) as CacheEntry<unknown>;
        await unlink(filePath);
        this.stats.size = Math.max(0, this.stats.size - entry.size);
        this.stats.entries = Math.max(0, this.stats.entries - 1);
        await this.saveStats();
      }
    } catch {
      logger.error('Failed to delete cache entry:');
      throw new DocsFetcherError(
        ErrorCode.CACHE_DELETE_ERROR,
        'Failed to delete cache entry'
      );
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await readdir(this.cacheDir);
      
      for (const file of files) {
        if (file === '.stats') continue;
        await unlink(join(this.cacheDir, file));
      }

      this.stats = {
        size: 0,
        entries: 0,
        hits: 0,
        misses: 0,
        lastCleanup: Date.now()
      };
      await this.saveStats();
    } catch {
      throw new DocsFetcherError(
        ErrorCode.CACHE_CLEAR_ERROR,
        'Failed to clear cache'
      );
    }
  }

  async cleanup(): Promise<void> {
    try {
      const files = await readdir(this.cacheDir);
      const now = Date.now();
      let deletedSize = 0;
      let remainingFiles = 0;

      logger.debug(`Starting cleanup at ${now}, TTL: ${this.ttl}ms`);

      for (const file of files) {
        if (file === '.stats') continue;
        const filePath = join(this.cacheDir, file);
        
        try {
          const data = await readFile(filePath, 'utf-8');
          const entry: CacheEntry<unknown> = JSON.parse(data);

          logger.debug(`Checking file ${file}, timestamp: ${entry.timestamp}`);
          if (this.isExpired(entry.timestamp)) {
            logger.debug(`Deleting expired file ${file}`);
            await unlink(filePath);
            deletedSize += entry.size;
          } else {
            logger.debug(`Keeping valid file ${file}`);
            remainingFiles++;
          }
        } catch (err) {
          // If we can't read the file or it's invalid, delete it
          logger.error(`Error processing file ${file}:`, err);
          try {
            await unlink(filePath);
          } catch {
            // Ignore deletion errors
          }
        }
      }

      // Update stats with actual remaining files
      logger.debug(`Cleanup complete. Remaining files: ${remainingFiles}`);
      this.stats.entries = remainingFiles;
      this.stats.size = Math.max(0, this.stats.size - deletedSize);
      this.stats.lastCleanup = now;
      await this.saveStats();
    } catch (err) {
      logger.error('Cleanup failed:', err);
      throw new DocsFetcherError(
        ErrorCode.CACHE_CLEANUP_ERROR,
        'Failed to cleanup cache'
      );
    }
  }

  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  async getDirectoryInfo(): Promise<DirectoryInfo> {
    try {
      const stats = await stat(this.cacheDir);
      const files = await readdir(this.cacheDir);
      
      return {
        path: this.cacheDir,
        exists: true,
        isWritable: true,
        size: stats.size,
        files: files.length,
        lastModified: stats.mtimeMs
      };
    } catch {
      throw new DocsFetcherError(
        ErrorCode.CACHE_INFO_ERROR,
        'Failed to get cache directory info'
      );
    }
  }

  private getFilePath(key: string): string {
    return join(this.cacheDir, `${key.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private isExpired(timestamp: number): boolean {
    const now = Date.now();
    const age = now - timestamp;
    const expired = age > this.ttl;
    logger.debug(`Cache entry age: ${age}ms, TTL: ${this.ttl}ms, Expired: ${expired}`);
    return expired;
  }

  private calculateSize(data: unknown): number {
    return Buffer.byteLength(JSON.stringify(data));
  }

  private async saveStats(): Promise<void> {
    try {
      const statsPath = join(this.cacheDir, '.stats');
      await writeFile(statsPath, JSON.stringify(this.stats));
    } catch {
      logger.error('Failed to save cache stats:');
    }
  }

  async close(): Promise<void> {
    try {
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = undefined;
      }
      // Save final stats before closing
      await this.saveStats();
    } catch (err) {
      logger.error('Error during cache manager close:', err);
    }
  }
}
