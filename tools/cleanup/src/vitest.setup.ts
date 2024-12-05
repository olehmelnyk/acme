import { vi } from 'vitest';
import { rm, existsSync } from 'fs';
import { sync as globSync } from 'glob';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  rm: vi.fn()
}));

// Mock fs
vi.mock('fs', () => ({
  existsSync: vi.fn()
}));

// Mock glob
vi.mock('glob', () => ({
  sync: vi.fn()
}));

// Mock readline
vi.mock('readline', () => ({
  createInterface: vi.fn(() => ({
    question: vi.fn(),
    close: vi.fn()
  }))
}));
