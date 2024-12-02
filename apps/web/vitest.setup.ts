import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Create a handler for CSS module imports
const cssModuleProxy = new Proxy(
  {},
  {
    get: function(_, className) {
      // Return the class name as is, simulating CSS modules behavior
      return className;
    },
  }
);

// Mock all CSS modules
vi.mock('**/*.module.css', () => ({
  default: cssModuleProxy,
}));

// Mock global CSS files
vi.mock('**/*.css', () => {
  return {
    default: {},
  };
});

// Mock Next.js font
vi.mock('next/font/google', async () => {
  return {
    Inter: ({ subsets }: { subsets: string[] }) => ({
      className: 'inter',
      style: { fontFamily: 'Inter' },
    }),
  };
});
