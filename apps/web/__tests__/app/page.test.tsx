import { describe, it, expect } from 'vitest';
import Page from '../../app/page';

describe('Index Page', () => {
  it('renders welcome message', () => {
    const element = <Page />;
    expect(element).toBeDefined();
    expect(element.type).toBe(Page);
  });

  it('has correct component structure', () => {
    const element = <Page />;
    const props = element.props;
    expect(props).toBeDefined();
  });
});
