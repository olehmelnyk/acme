import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Index from '../../app/page';

// Mock CSS modules
vi.mock('../../app/page.module.css', () => ({
  default: {
    page: 'page-class',
  },
}));

describe('Index Page', () => {
  beforeEach(() => {
    render(<Index />);
  });

  it('renders welcome message', () => {
    expect(screen.getByText('Hello there,')).toBeInTheDocument();
    expect(screen.getByText('Welcome next 👋')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const pageElement = screen.getByTestId('page-container');
    expect(pageElement).toHaveClass('page-class');
  });

  it('renders learning materials section with correct content', () => {
    const learningSection = screen.getByTestId('learning-materials');
    expect(learningSection).toBeInTheDocument();
    expect(screen.getByText('Learning materials')).toBeInTheDocument();
    
    // Check documentation link
    const docLink = screen.getByRole('link', { 
      name: /Documentation Everything is in there/i 
    });
    expect(docLink).toHaveAttribute('href', 'https://nx.dev/getting-started/intro?utm_source=nx-project');
    expect(docLink).toHaveAttribute('target', '_blank');
  });

  it('renders next steps section with correct content', () => {
    const nextStepsSection = screen.getByTestId('commands');
    expect(nextStepsSection).toBeInTheDocument();
    expect(screen.getByText('Next steps')).toBeInTheDocument();
    expect(screen.getByText('Here are some things you can do with Nx:')).toBeInTheDocument();
  });

  it('renders the hero section with status message', () => {
    const heroSection = screen.getByTestId('hero');
    expect(heroSection).toBeInTheDocument();
    expect(screen.getByText("You're up and running")).toBeInTheDocument();
    
    const nextLink = screen.getByText("What's next?");
    expect(nextLink).toHaveAttribute('href', '#commands');
  });

  it('renders all navigation links correctly', () => {
    const links = screen.getAllByRole('link');
    
    // VS Code extension link
    const vsCodeLink = screen.getByTestId('nx-console');
    expect(vsCodeLink).toHaveAttribute('href', expect.stringContaining('marketplace.visualstudio.com'));
    expect(vsCodeLink).toHaveAttribute('target', '_blank');
    
    // Cloud section
    const cloudSection = screen.getByTestId('nx-cloud');
    expect(cloudSection).toBeInTheDocument();
    expect(screen.getByTestId('nx-cloud-logo')).toBeInTheDocument();
  });

  it('renders SVG icons correctly', () => {
    const svgIcons = screen.getAllByRole('img');
    expect(svgIcons.length).toBeGreaterThan(0);
    
    // Check specific SVG elements
    expect(screen.getByTestId('nx-cloud-logo')).toBeInTheDocument();
  });
});
