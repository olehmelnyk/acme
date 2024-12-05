import { beforeAll, afterEach } from 'bun:test';
import { cleanup } from '@testing-library/react';

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
  interface Global {
    console: any;
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

// Mock Next.js font
const mockFont = {
  className: 'inter-font-class',
  style: { fontFamily: 'Inter' }
};

jest.mock('next/font/google', () => ({
  Inter: () => mockFont
}));

// Mock Next.js navigation
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn()
};

const mockPathname = '/';
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});
