import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '../src/cache-manager';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('CacheManager', () => {
  const testCacheDir = path.join(process.cwd(), 'test-cache');
  const maxSize = 1024 * 1024; // 1MB
  const ttl = 1000; // 1 second
  let cacheManager: CacheManager;

  beforeEach(async () => {
    // Ensure clean state before each test
    if (await fs.pathExists(testCacheDir)) {
      await fs.rm(testCacheDir, { recursive: true, force: true });
    }
    await fs.mkdir(testCacheDir, { recursive: true });
    cacheManager = new CacheManager(testCacheDir, maxSize, ttl);
    await cacheManager.init();
  });

  afterEach(async () => {
    if (cacheManager) {
      await cacheManager.close();
      // Ensure cleanup after each test
      if (await fs.pathExists(testCacheDir)) {
        await fs.rm(testCacheDir, { recursive: true, force: true });
      }
    }
  });

  it('should create cache directory if it does not exist', async () => {
    const exists = await fs.access(testCacheDir).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('should store and retrieve data', async () => {
    const key = 'test-key';
    const data = { test: 'data' };

    await cacheManager.setNew(key, data);
    const retrieved = await cacheManager.get<typeof data>(key);

    expect(retrieved).toEqual(data);
  });

  it('should return null for non-existent key', async () => {
    const result = await cacheManager.get('non-existent');
    expect(result).toBeNull();
  });

  it('should return null for expired data', async () => {
    const key = 'expired-key';
    const data = { test: 'data' };

    await cacheManager.setNew(key, data);
    await new Promise(resolve => setTimeout(resolve, ttl + 100));
    
    const retrieved = await cacheManager.get(key);
    expect(retrieved).toBeNull();
  });

  it('should enforce maximum cache size', async () => {
    const key = 'large-data';
    const largeData = Buffer.alloc(maxSize + 1).toString();

    await expect(cacheManager.setNew(key, largeData)).rejects.toThrow();
  });

  it('should cleanup expired entries', async () => {
    const keys = ['key1', 'key2', 'key3'];
    const data = { test: 'data' };

    for (const key of keys) {
      await cacheManager.setNew(key, data);
    }

    // Wait longer to ensure all entries are expired, accounting for setup time
    await new Promise(resolve => setTimeout(resolve, ttl + 500));
    await cacheManager.cleanup();

    const stats = await cacheManager.getStats();
    expect(stats.entries).toBe(0);
  });

  it('should track cache stats correctly', async () => {
    const key = 'stats-test';
    const data = { test: 'data' };

    await cacheManager.setNew(key, data);
    await cacheManager.get(key);
    await cacheManager.get('non-existent');

    const stats = await cacheManager.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.entries).toBe(1);
    expect(stats.size).toBeGreaterThan(0);
  });

  it('should delete cache entry', async () => {
    const key = 'delete-test';
    const data = { test: 'data' };

    await cacheManager.setNew(key, data);
    await cacheManager.delete(key);

    const retrieved = await cacheManager.get(key);
    expect(retrieved).toBeNull();

    const stats = await cacheManager.getStats();
    expect(stats.entries).toBe(0);
  });

  it('should clear all cache entries', async () => {
    const keys = ['clear1', 'clear2', 'clear3'];
    const data = { test: 'data' };

    for (const key of keys) {
      await cacheManager.setNew(key, data);
    }

    await cacheManager.clear();

    const stats = await cacheManager.getStats();
    expect(stats.entries).toBe(0);
    expect(stats.size).toBe(0);
  });

  it('should get directory info', async () => {
    const key = 'info-test';
    const data = { test: 'data' };

    await cacheManager.setNew(key, data);

    const info = await cacheManager.getDirectoryInfo();
    expect(info.exists).toBe(true);
    expect(info.isWritable).toBe(true);
    expect(info.files).toBeGreaterThan(0);
    expect(info.size).toBeGreaterThan(0);
  });
});
