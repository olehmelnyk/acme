import '@testing-library/jest-dom';
import { beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { Window } from 'happy-dom';

// Set up Happy DOM
beforeAll(() => {
  const window = new Window();
  const document = window.document;

  // Add window and document to global scope
  Object.defineProperty(globalThis, 'window', {
    value: window,
    writable: true
  });

  Object.defineProperty(globalThis, 'document', {
    value: document,
    writable: true
  });
});

// Mock window properties that are not available in Happy DOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Add missing DOM APIs
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Create a handler for CSS module imports
const cssModuleProxy = new Proxy(
  {},
  {
    get: function(_, className) {
      return className;
    },
  }
);

// Mock CSS modules
vi.mock('*.module.css', () => cssModuleProxy);
vi.mock('*.module.scss', () => cssModuleProxy);

// Mock Next.js font
vi.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
    style: { fontFamily: 'Inter' },
    variable: '--font-inter',
  }),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Tailwind CSS
vi.mock('tailwindcss/tailwind.css', () => ({}));

// Clean up after each test
beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterEach(() => {
  cleanup();
});
