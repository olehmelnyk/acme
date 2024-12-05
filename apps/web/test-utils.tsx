import { ReactElement } from 'react';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

// Set up global variables
global.window = dom.window as unknown as Window & typeof globalThis;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Custom render function
export function render(element: ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  // Simple React-like rendering
  const Component = () => element;
  const instance = new Component();
  container.innerHTML = instance.render().toString();
  
  return {
    container,
    getByText: (text: string) => {
      const elements = container.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent?.includes(text)) {
          return el;
        }
      }
      throw new Error(`Text "${text}" not found`);
    },
    getByRole: (role: string, options?: { name?: RegExp }) => {
      const elements = container.querySelectorAll(`[role="${role}"]`);
      for (const el of elements) {
        if (!options?.name || options.name.test(el.textContent || '')) {
          return el;
        }
      }
      throw new Error(`Role "${role}" not found`);
    }
  };
}
