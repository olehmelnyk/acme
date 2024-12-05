import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, mkdir, readFile, readdir, rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { BackupManager } from '../src/backup/backup-manager';
import { ConfigurationManager } from '../src/utils/config-manager';

// Helper function to check if path exists
async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

describe('Backup Manager', () => {
  let tempDir: string;
  let backupManager: BackupManager;
  let mockDiagramsDir: string;
  let mockBackupDir: string;

  // Mock diagram content for testing
  const mockDiagrams = {
    'system-arch.md': `# System Architecture
    
    This is a test diagram.
    
    \`\`\`mermaid
    graph TB
        A[Client] --> B[Server]
    \`\`\``,
    
    'data-flow.md': `# Data Flow
    
    Another test diagram.
    
    \`\`\`mermaid
    graph LR
        A --> B
    \`\`\``,
  };

  beforeEach(async () => {
    // Reset configuration manager
    ConfigurationManager.resetInstance();

    // Create temporary test directories
    tempDir = await mkdtemp(join(tmpdir(), 'backup-tests-'));
    mockDiagramsDir = join(tempDir, 'docs/architecture/diagrams');
    mockBackupDir = join(tempDir, '.diagrams-backup');

    // Create test diagram files
    await mkdir(join(mockDiagramsDir, 'system'), { recursive: true });
    await mkdir(join(mockDiagramsDir, 'data-flow'), { recursive: true });

    await writeFile(
      join(mockDiagramsDir, 'system/system-arch.md'),
      mockDiagrams['system-arch.md']
    );
    await writeFile(
      join(mockDiagramsDir, 'data-flow/data-flow.md'),
      mockDiagrams['data-flow.md']
    );

    // Create mock configuration
    const configPath = join(tempDir, 'tools/docs-manager/config/backup.json');
    await mkdir(join(tempDir, 'tools/docs-manager/config'), { recursive: true });
    await writeFile(configPath, JSON.stringify({
      paths: {
        diagramsRoot: 'docs/architecture/diagrams',
        backupDir: '.diagrams-backup'
      },
      maintenance: {
        maxBackupAge: '30d',
        compressionEnabled: false,
        retainCount: 5
      },
      scheduling: {
        enabled: false,
        interval: '24h',
        timeOfDay: '02:00'
      }
    }));

    // Initialize backup manager with temp directory as working directory
    backupManager = new BackupManager(tempDir);
    await backupManager.initialize();
  });

  afterEach(async () => {
    // Clean up temporary directory
    await rm(tempDir, { recursive: true, force: true });
    // Reset configuration manager
    ConfigurationManager.resetInstance();
  });

  describe('createBackup', () => {
    it('should create a backup with all diagram files', async () => {
      const backupPath = await backupManager.createBackup();
      
      // Check if backup directory was created
      const backupExists = await exists(backupPath);
      expect(backupExists).toBe(true);

      // Check if all files were backed up
      const files = await readdir(backupPath, { recursive: true });
      const fileList = files.filter(f => f.endsWith('.md'));
      expect(fileList).toContain('system/system-arch.md');
      expect(fileList).toContain('data-flow/data-flow.md');

      // Verify backup metadata
      const metadata = JSON.parse(
        await readFile(join(backupPath, 'backup-metadata.json'), 'utf-8')
      );
      expect(metadata).toMatchObject({
        timestamp: expect.any(Number),
        files: expect.arrayContaining([
          'system/system-arch.md',
          'data-flow/data-flow.md'
        ]),
        size: expect.any(Number),
        version: expect.any(String)
      });
    });

    it('should preserve file content in backups', async () => {
      const backupPath = await backupManager.createBackup();
      
      // Read original and backed up files
      const originalContent = await readFile(
        join(mockDiagramsDir, 'system/system-arch.md'),
        'utf-8'
      );
      const backedUpContent = await readFile(
        join(backupPath, 'system/system-arch.md'),
        'utf-8'
      );
      
      expect(backedUpContent).toBe(originalContent);
    });
  });

  describe('cleanupOldBackups', () => {
    it('should remove backups older than maxBackupAge', async () => {
      // Create an old backup
      const oldBackupPath = join(mockBackupDir, 'backup-2023-01-01');
      await mkdir(oldBackupPath, { recursive: true });
      await writeFile(
        join(oldBackupPath, 'backup-metadata.json'),
        JSON.stringify({
          timestamp: new Date('2023-01-01').getTime(),
          files: [],
          size: 0,
          version: '1.0.0'
        })
      );

      // Create a recent backup
      const recentBackupPath = await backupManager.createBackup();

      // Run cleanup
      await backupManager.cleanupOldBackups();

      // Old backup should be removed
      expect(await exists(oldBackupPath)).toBe(false);
      // Recent backup should remain
      expect(await exists(recentBackupPath)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing directories gracefully', async () => {
      await rm(mockDiagramsDir, { recursive: true, force: true });
      
      await expect(backupManager.createBackup()).rejects.toThrow('No diagram files found to backup');
    });

    it('should handle invalid backup metadata', async () => {
      const backupPath = await backupManager.createBackup();
      await writeFile(join(backupPath, 'backup-metadata.json'), 'invalid json');
      
      await expect(backupManager.cleanupOldBackups()).rejects.toThrow();
    });
  });
});
