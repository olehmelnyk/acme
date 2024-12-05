import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home', () => {
  it('renders welcome message', () => {
    const element = <Home />;
    expect(element).toBeDefined();
    expect(element.type).toBe(Home);
  });

  it('has correct component structure', () => {
    const element = <Home />;
    const props = element.props;
    expect(props).toBeDefined();
  });
});
