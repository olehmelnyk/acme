import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Page from '../app/page';

describe('Page', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Page />);
    expect(baseElement).toBeTruthy();
  });

  it('should display welcome message', () => {
    render(<Page />);
    expect(screen.getByText(/Hello there/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome next/i)).toBeInTheDocument();
  });

  it('should render main sections', () => {
    render(<Page />);
    expect(screen.getByTestId('page-container')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('learning-materials')).toBeInTheDocument();
    expect(screen.getByTestId('nx-console')).toBeInTheDocument();
    expect(screen.getByTestId('nx-cloud')).toBeInTheDocument();
    expect(screen.getByTestId('commands')).toBeInTheDocument();
  });

  it('should have learning materials section with link', () => {
    render(<Page />);
    const link = screen.getByText(/Learning materials/i).closest('div')?.querySelector('a');
    expect(link).toHaveAttribute('href', 'https://nx.dev/getting-started/intro?utm_source=nx-project');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
