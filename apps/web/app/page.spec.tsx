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
  });

  it('should have learning materials section with link', () => {
    render(<Home />);
    const link = screen.getByRole('link', { name: /Learning materials/i });
    expect(link).toHaveAttribute('href', 'https://nx.dev/getting-started/intro?utm_source=nx-project');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
