import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock CSS modules
vi.mock('*.module.css', () => ({
  default: new Proxy(
    {},
    {
      get: (_, prop) => prop,
    }
  ),
}));
