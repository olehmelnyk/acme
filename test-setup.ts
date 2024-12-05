import '@testing-library/jest-dom';
import { afterEach } from '@jest/globals';
import { cleanup } from '@testing-library/react';
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

// Mock Next.js font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    style: {
      fontFamily: 'Inter'
    }
  })
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});
