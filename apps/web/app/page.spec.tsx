/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Home from './page';

describe('Home', () => {
  it('renders welcome message', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /Hello there, Welcome next/i });
    expect(heading).toBeDefined();
  });

  it('renders navigation links', () => {
    render(<Home />);
    
    // Check for the "What's next?" link
    const whatsNextLink = screen.getByRole('link', { name: /What's next\?/i });
    expect(whatsNextLink).toBeDefined();
    expect(whatsNextLink.getAttribute('href')).toBe('#commands');

    // Check for the Documentation link
    const docsLink = screen.getByRole('link', { name: /Documentation Everything is in there/i });
    expect(docsLink).toBeDefined();
    expect(docsLink.getAttribute('href')).toBe('https://nx.dev/getting-started/intro?utm_source=nx-project');
  });
});
