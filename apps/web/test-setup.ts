import { afterEach } from '@jest/globals';
import { cleanup } from '@testing-library/react';
import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'util';
import { Window } from 'happy-dom';

const window = new Window();
const document = window.document;

// Setup global variables
Object.defineProperty(global, 'window', {
  value: window,
  writable: true
});

Object.defineProperty(global, 'document', {
  value: document,
  writable: true
});

Object.defineProperty(global, 'navigator', {
  value: window.navigator,
  writable: true
});

// Polyfill TextEncoder and TextDecoder if needed
if (typeof globalThis.TextEncoder === 'undefined') {
  (globalThis as any).TextEncoder = NodeTextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  (globalThis as any).TextDecoder = NodeTextDecoder;
}

interface Mock {
  (...args: any[]): any;
  mock: {
    calls: any[][];
    returnValue: any;
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    function fn(): Mock;
    function mock(path: string, factory: () => any): void;
  }
}

// Mock Next.js modules
(global as any).jest = {
  fn: () => {
    const fn = ((...args: any[]) => {
      fn.mock.calls.push(args);
      return fn.mock.returnValue;
    }) as Mock;
    fn.mock = { calls: [], returnValue: undefined };
    return fn;
  },
  mock: (path: string, factory: () => any) => {
    const module = factory();
    (global as any)[path] = module;
  }
};

jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
    style: { fontFamily: 'Inter' }
  })
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});
