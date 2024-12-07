import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sync as globSync } from 'glob';
import { spawnSync } from 'child_process';

vi.mock('glob');
vi.mock('child_process');

describe('install-all', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    
    // Default mock implementations
    vi.mocked(globSync).mockReturnValue([]);
    vi.mocked(spawnSync).mockReturnValue({
      status: 0,
      stdout: Buffer.from(''),
      stderr: Buffer.from(''),
      pid: 123,
      output: [],
      signal: null
    });
  });

  it('should find and process all package.json files', async () => {
    vi.mocked(globSync).mockReturnValue([
      '/test/root/package.json',
      '/test/root/apps/web/package.json'
    ]);

    // Import the script (this will execute it)
    await import('./install-all');

    expect(globSync).toHaveBeenCalledWith('**/package.json', {
      ignore: ['**/node_modules/**'],
      absolute: true
    });

    expect(spawnSync).toHaveBeenCalledTimes(2);
    expect(spawnSync).toHaveBeenCalledWith('bun', ['install'], expect.any(Object));
  });

  it('should exit with error if installation fails', async () => {
    vi.mocked(globSync).mockReturnValue(['/test/root/package.json']);
    vi.mocked(spawnSync).mockReturnValue({
      status: 1,
      stdout: Buffer.from(''),
      stderr: Buffer.from('error'),
      pid: 123,
      output: [],
      signal: null
    });

    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process.exit(${code})`);
    });

    try {
      await import('./install-all');
    } catch (error) {
      expect(error.message).toBe('Process.exit(1)');
    }

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
