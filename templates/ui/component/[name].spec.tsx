import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName />);
    const element = screen.getByTestId('component-name');
    expect(element).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'test-class';
    render(<ComponentName className={customClass} />);
    const element = screen.getByTestId('component-name');
    expect(element).toHaveClass(customClass);
  });
});
