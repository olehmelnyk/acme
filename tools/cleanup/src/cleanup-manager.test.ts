import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CleanupManager } from './cleanup-manager';
import { existsSync } from 'fs';
import { rm } from 'fs/promises';
import { sync as globSync } from 'glob';

vi.mock('fs/promises');
vi.mock('fs');
vi.mock('glob');

describe('CleanupManager', () => {
  let cleanupManager: CleanupManager;
  const rootDir = '/test/root';

  beforeEach(() => {
    cleanupManager = new CleanupManager(rootDir);
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(rm).mockResolvedValue(undefined);
    vi.mocked(globSync).mockReturnValue([]);
  });

  describe('run', () => {
    it('should clean artifacts when artifacts option is true', async () => {
      vi.mocked(globSync).mockReturnValueOnce(['/test/root/artifacts/dir1']);

      await cleanupManager.run({ artifacts: true, force: true });

      expect(globSync).toHaveBeenCalledWith('**/artifacts/**', {
        cwd: rootDir,
        absolute: true,
        ignore: ['**/node_modules/**']
      });
      expect(rm).toHaveBeenCalledWith('/test/root/artifacts/dir1', { recursive: true, force: true });
    });

    it('should clean backups when backups option is true', async () => {
      await cleanupManager.run({ backups: true, force: true });

      expect(rm).toHaveBeenCalledWith('/test/root/.diagrams-backup', { recursive: true, force: true });
    });

    it('should clean old scripts when oldScripts option is true', async () => {
      await cleanupManager.run({ oldScripts: true, force: true });

      expect(rm).toHaveBeenCalledWith('/test/root/scripts/docs', { recursive: true, force: true });
      expect(rm).toHaveBeenCalledWith('/test/root/tests/docs', { recursive: true, force: true });
    });

    it('should not delete anything in dry run mode', async () => {
      vi.mocked(globSync).mockReturnValue(['/test/root/artifacts/dir1']);

      await cleanupManager.run({ artifacts: true, dryRun: true });

      expect(rm).not.toHaveBeenCalled();
    });

    it('should skip non-existent paths', async () => {
      vi.mocked(globSync).mockReturnValue(['/test/root/artifacts/dir1']);
      vi.mocked(existsSync).mockReturnValue(false);

      await cleanupManager.run({ artifacts: true, force: true });

      expect(rm).not.toHaveBeenCalled();
    });
  });
});
